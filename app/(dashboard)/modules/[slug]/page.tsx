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

    const [moduleRes, userModuleRes, questionsRes] = await Promise.all([
        supabase.from('modules').select('*').eq('slug', slug).single(),
        supabase.from('user_modules').select('*').eq('user_id', user.id).eq('module_id',
            (await supabase.from('modules').select('id').eq('slug', slug).single()).data?.id || ''
        ).single(),
        supabase.from('questions').select('*').eq('module_id',
            (await supabase.from('modules').select('id').eq('slug', slug).single()).data?.id || ''
        ),
    ])

    if (!moduleRes.data) notFound()

    return (
        <ModuleDetail
            module={moduleRes.data}
            userModule={userModuleRes.data || null}
            questions={questionsRes.data || []}
            userId={user.id}
        />
    )
}
