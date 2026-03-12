import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ModuleDetail from './ModuleDetail'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function ModulePage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const moduleRes = await supabase.from('modules').select('*').eq('slug', slug).single()
    if (!moduleRes.data) notFound()

    const moduleId = moduleRes.data.id
    const [profileRes, userModuleRes, questionsRes, xpClaimRes] = await Promise.all([
        supabase.from('profiles').select('avatar_class').eq('id', user.id).single(),
        supabase.from('user_modules').select('*').eq('user_id', user.id).eq('module_id', moduleId).maybeSingle(),
        supabase.from('questions').select('*').eq('module_id', moduleId),
        supabase
            .from('xp_logs')
            .select('id')
            .eq('user_id', user.id)
            .ilike('reason', `%[module:${moduleId}]%`)
            .limit(1),
    ])

    const completedFromLog = (xpClaimRes.data?.length ?? 0) > 0

    return (
        <ModuleDetail
            module={moduleRes.data}
            userModule={userModuleRes.data || null}
            completedFromLog={completedFromLog}
            questions={questionsRes.data || []}
            userId={user.id}
            avatarClass={profileRes.data?.avatar_class || 'warrior'}
        />
    )
}
