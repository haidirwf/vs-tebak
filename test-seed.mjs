import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vbcticqkziiukxhtrmdx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiY3RpY3FremlpdWt4aHRybWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzM4MTMsImV4cCI6MjA4ODYwOTgxM30.1nMOtLO_eI_UYy7ghyfeuc7SD83UO9MJRScOE8kHwk0'
)

async function test() {
  const { data: q, error: qErr } = await supabase.from('daily_quests').select('id')
  console.log('quests:', q, qErr)

  const { error } = await supabase.from('user_daily_quests').insert([{
    user_id: '00000000-0000-0000-0000-000000000000', // invalid uuid
    quest_id: q[0].id,
    current_value: 0,
    is_completed: false,
    date: '2026-03-13'
  }])

  console.log('insert error:', error)
}
test()
