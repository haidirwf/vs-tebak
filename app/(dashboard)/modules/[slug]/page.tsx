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
    const [profileRes, userModuleRes, questionsRes] = await Promise.all([
        supabase.from('profiles').select('avatar_class').eq('id', user.id).maybeSingle(),
        supabase.from('user_modules').select('*').eq('user_id', user.id).eq('module_id', moduleId).maybeSingle(),
        supabase.from('questions').select('*').eq('module_id', moduleId),
    ])

    const isCompleted = userModuleRes.data?.status === 'completed'

    return (
        <ModuleDetail
            module={moduleRes.data}
            userModule={userModuleRes.data || null}
            completedFromLog={isCompleted}
            questions={questionsRes.data || []}
            avatarClass={profileRes.data?.avatar_class || 'warrior'}
        />
    )
}
