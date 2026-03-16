import { createClient } from '@/lib/supabase/server'
import { Module, UserModule } from '@/types'
import ModulesClient from './ModulesClient'

export default async function ModulesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [modulesRes, userModulesRes, profileRes, xpLogsRes] = await Promise.all([
        supabase
            .from('modules')
            .select('id, slug, title, description, category, difficulty, xp_reward, duration_minutes, thumbnail_url, content, is_published, created_at')
            .eq('is_published', true)
            .order('created_at'),
        user
            ? supabase
                .from('user_modules')
                .select('id, user_id, module_id, status, progress_percent, completed_at, xp_granted_at')
                .eq('user_id', user!.id)
            : Promise.resolve({ data: [] }),
        user ? supabase.from('profiles').select('avatar_class').eq('id', user!.id).single() : Promise.resolve({ data: null }),
        user ? supabase.from('xp_logs').select('reason').eq('user_id', user!.id).ilike('reason', '%[module:%').limit(500) : Promise.resolve({ data: [] }),
    ])

    const dbUserModules = (userModulesRes.data as UserModule[]) || []
    const moduleClaimSet = new Set<string>()
    for (const row of xpLogsRes.data || []) {
        const reason = row.reason || ''
        const match = reason.match(/\[module:([a-f0-9-]+)\]/i)
        if (match?.[1]) moduleClaimSet.add(match[1])
    }

    const syntheticCompleted: UserModule[] = user
        ? Array.from(moduleClaimSet)
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
        : []

    const mergedUserModules = [...dbUserModules, ...syntheticCompleted]

    return (
        <ModulesClient
            modules={(modulesRes.data as Module[]) || []}
            userModules={mergedUserModules}
            avatarClass={profileRes.data?.avatar_class || 'warrior'}
        />
    )
}
