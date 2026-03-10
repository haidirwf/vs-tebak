async function run() {
    await import('dotenv/config')
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: ghosts, error: selectError } = await supabase
        .from('battles')
        .select('*')
        .eq('status', 'waiting')

    if (selectError) {
        console.log('Select error:', selectError)
        return
    }

    console.log('Found ghost rooms:', ghosts ? ghosts.length : 0)

    if (ghosts && ghosts.length > 0) {
        const ids = ghosts.map((g) => g.id)
        const { error: delError } = await supabase.from('battles').delete().in('id', ids)
        console.log('Delete error:', delError)
        console.log('Deleted all waiting ghost rooms.')
    }
}
run()
