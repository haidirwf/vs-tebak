const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data: ghosts, error: selError } = await supabase
        .from('battles')
        .select('*')
        .eq('status', 'waiting');
    
    console.log("Found ghost rooms:", ghosts ? ghosts.length : 0);
    
    if (ghosts && ghosts.length > 0) {
        const ids = ghosts.map(g => g.id);
        const { error: delError } = await supabase.from('battles').delete().in('id', ids);
        console.log("Delete error:", delError);
        console.log("Deleted all waiting ghost rooms.");
    }
}
run();
