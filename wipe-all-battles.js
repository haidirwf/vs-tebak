async function run() {
    const { createClient } = await import('@supabase/supabase-js')
    const { readFileSync } = await import('node:fs')

    const envContent = readFileSync('.env.local', 'utf8')
    const envVars = {}
    envContent.split('\n').forEach((line) => {
        const parts = line.split('=')
        if (parts.length >= 2) {
            envVars[parts[0]] = line.substring(line.indexOf('=') + 1).trim()
        }
    })

    const url = envVars['NEXT_PUBLIC_SUPABASE_URL']
    const anonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']

    const supabase = createClient(url, anonKey)

    const { data: before, error: getErr } = await supabase.from('battles').select('id, room_code, status')
    console.log(`Found ${before ? before.length : 0} battles in DB.`, getErr || '')

    if (before && before.length > 0) {
        console.log('Rooms found:', before.map((b) => `${b.room_code} (${b.status})`).join(', '))
        const ids = before.map((b) => b.id)
        const { error: delErr } = await supabase.from('battles').delete().in('id', ids)
        console.log('Delete result error:', delErr || 'None')

        const { data: after } = await supabase.from('battles').select('id')
        console.log(`Remaining battles after delete: ${after ? after.length : 0}`)
    } else {
        console.log("No battles to delete. If they show on UI, it's 100% caching.")
    }
}
run()
