'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Module, UserModule } from '@/types'
import ModulesClient from './ModulesClient'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'

export default function ModulesPage() {
    const router = useRouter()
    const { profile } = useUserStore()
    const { modules, userModules, modulesFetchedAt, setModulesData } = useContentStore()
    const [isLoading, setIsLoading] = useState(!modulesFetchedAt)

    useEffect(() => {
        const supabase = createClient()

        async function fetchModules() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            try {
                const [modulesRes, userModulesRes, xpLogsRes] = await Promise.all([
                    supabase
                        .from('modules')
                        .select('id, slug, title, description, category, difficulty, xp_reward, duration_minutes, thumbnail_url, content, is_published, created_at')
                        .eq('is_published', true)
                        .order('created_at'),
                    supabase
                        .from('user_modules')
                        .select('id, user_id, module_id, status, progress_percent, completed_at, xp_granted_at')
                        .eq('user_id', user.id),
                    supabase
                        .from('xp_logs')
                        .select('reason')
                        .eq('user_id', user.id)
                        .ilike('reason', '%[module:%')
                        .limit(500),
                ])

                const dbUserModules = (userModulesRes.data as UserModule[]) || []
                const moduleClaimSet = new Set<string>()
                for (const row of xpLogsRes.data || []) {
                    const reason = row.reason || ''
                    const match = reason.match(/\[module:([a-f0-9-]+)\]/i)
                    if (match?.[1]) moduleClaimSet.add(match[1])
                }

                const syntheticCompleted: UserModule[] = Array.from(moduleClaimSet)
                    .filter((moduleId) => !dbUserModules.some((um) => um.module_id === moduleId))
                    .map((moduleId) => ({
                        id: `xp-log-${moduleId}`,
                        user_id: user.id,
                        module_id: moduleId,
                        status: 'completed',
                        progress_percent: 100,
                        completed_at: null,
                        xp_granted_at: null,
                    }))

                const mergedUserModules = [...dbUserModules, ...syntheticCompleted]

                setModulesData({
                    modules: (modulesRes.data as Module[]) || [],
                    userModules: mergedUserModules,
                })
            } catch (err) {
                console.error('Error loading modules:', err)
            } finally {
                setIsLoading(false)
            }
        }

        const isStale = !modulesFetchedAt || Date.now() - modulesFetchedAt > 60_000
        if (isStale) {
            fetchModules()
        } else {
            setIsLoading(false)
        }
    }, [modulesFetchedAt, setModulesData, router])

    if (isLoading && modules.length === 0) {
        return (
            <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="sq-skeleton" style={{ height: '32px', width: '240px', marginBottom: '20px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card" style={{ padding: '20px', height: '220px' }}>
                            <div className="sq-skeleton" style={{ height: '20px', width: '70%', marginBottom: '12px' }} />
                            <div className="sq-skeleton" style={{ height: '14px', width: '90%', marginBottom: '8px' }} />
                            <div className="sq-skeleton" style={{ height: '14px', width: '60%', marginBottom: '20px' }} />
                            <div className="sq-skeleton" style={{ height: '36px', width: '100%' }} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <ModulesClient
            modules={modules}
            userModules={userModules}
            avatarClass={profile?.avatar_class || 'warrior'}
        />
    )
}
