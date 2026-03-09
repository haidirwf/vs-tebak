import { createClient } from '@/lib/supabase/server'
import { Module } from '@/types'
import ModulesClient from './ModulesClient'

export default async function ModulesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [modulesRes, userModulesRes] = await Promise.all([
        supabase.from('modules').select('*').eq('is_published', true).order('created_at'),
        user ? supabase.from('user_modules').select('*').eq('user_id', user!.id) : Promise.resolve({ data: [] }),
    ])

    return (
        <ModulesClient
            modules={(modulesRes.data as Module[]) || []}
            userModules={userModulesRes.data || []}
        />
    )
}
