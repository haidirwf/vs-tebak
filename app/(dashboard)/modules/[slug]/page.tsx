import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ModuleDetail from './ModuleDetail'
import { getAuthenticatedUser, getAuthenticatedProfile } from '@/lib/auth/get-user'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function ModulePage({ params }: PageProps) {
    const { slug } = await params
    const user = await getAuthenticatedUser()
    if (!user) {
        redirect('/login')
    }

    const [profile, supabase] = await Promise.all([
        getAuthenticatedProfile(user.id),
        createClient(),
    ])

    // PostgREST 1-roundtrip relational join: ambil module + questions + status user dalam 1 query!
    const { data: moduleData, error } = await supabase
        .from('modules')
        .select(`
            *,
            questions(*),
            user_modules(*)
        `)
        .eq('slug', slug)
        .single()

    if (error || !moduleData) notFound()

    const { questions, user_modules: userModulesList, ...module } = moduleData
    const userModule = (userModulesList as any[])?.[0] || null
    const isCompleted = userModule?.status === 'completed'

    return (
        <ModuleDetail
            module={module}
            userModule={userModule}
            completedFromLog={isCompleted}
            questions={(questions as any[]) || []}
            avatarClass={profile?.avatar_class || 'warrior'}
        />
    )
}
