import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/battle/admin  - Hapus semua waiting room yang lama
// (hanya untuk cleanup, bisa dipanggil sekali)
export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hapus semua room yang dimiliki user yang sedang login yang statusnya waiting
    const { data: deleted, error: err1 } = await supabase
        .from('battles')
        .delete()
        .eq('player1_id', user.id)
        .eq('status', 'waiting')
        .select('id, room_code')

    return NextResponse.json({
        message: 'Cleaned up!',
        deleted_by_you: deleted || [],
        error: err1?.message || null,
    })
}
