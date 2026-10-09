import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://evmoinjxlsywcgckapxg.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bW9pbmp4bHN5d2NnY2thcHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzQ4ODYsImV4cCI6MjEwNjIxMDg4Nn0.TWHXMN_aW5k6OILlgwX6Hk2nzN6uI996VfVXT7PdOr8'

export async function seedBoostAccount({
  email = 'boostdemo@skillungo.com',
  password = 'Password123!',
  username = 'boostmaster',
  fullName = 'Boost Master',
  schoolName = 'SMK Unggulan',
  city = 'Jakarta',
  avatarClass = 'warrior',
  targetXp = 10000,
  streakCount = 14
} = {}) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log(`[Seed] Mengautentikasi / mendaftarkan akun ${email}...`)

  // 1. Coba login dulu
  let session = null
  let userId = null

  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (!signInErr && signInData?.session) {
    session = signInData.session
    userId = signInData.user.id
    console.log(`[Seed] Berhasil login sebagai akun lama (${userId})`)
  } else {
    // Coba sign up jika belum ada
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          school_name: schoolName,
          city
        }
      }
    })

    if (signUpErr) {
      throw new Error(`Gagal registrasi akun: ${signUpErr.message}`)
    }

    session = signUpData?.session
    userId = signUpData?.user?.id

    // Jika butuh login setelah signup
    if (!session) {
      const loginRetry = await supabase.auth.signInWithPassword({ email, password })
      session = loginRetry.data?.session
    }

    console.log(`[Seed] Berhasil mendaftarkan akun baru (${userId})`)
  }

  if (!session || !userId) {
    throw new Error('Tidak dapat memperoleh session user.')
  }

  const authenticatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    }
  })

  // Hitung level sesuai formula game
  function getXpRequired(lvl) {
    return Math.floor(100 * Math.pow(lvl, 1.5))
  }
  let level = 1
  let remaining = targetXp
  while (remaining >= getXpRequired(level)) {
    remaining -= getXpRequired(level)
    level++
  }
  const xpToNext = getXpRequired(level)

  console.log(`[Seed] Memperbarui profil: XP=${targetXp}, Level=${level}, SisaXP=${remaining}/${xpToNext}...`)

  const { data: profileData, error: profErr } = await authenticatedClient
    .from('profiles')
    .update({
      username,
      full_name: fullName,
      school_name: schoolName,
      city,
      avatar_class: avatarClass,
      xp: targetXp,
      level,
      xp_to_next_level: xpToNext,
      streak_count: streakCount,
      last_active: new Date().toISOString().slice(0, 10),
      character_created: true,
      has_completed_streak_onboarding: true,
      equipped_items: {
        weapon: 'wpn_dragon_slayer',
        head: 'helm_valkyrie',
        armor: 'armor_aegis_plate',
        accessory: 'acc_infinity_stone'
      }
    })
    .eq('id', userId)
    .select()

  if (profErr) {
    throw new Error(`Gagal update profil: ${profErr.message}`)
  }

  // Lengkapi modules
  const { data: modules } = await authenticatedClient.from('modules').select('id').limit(10)
  if (modules && modules.length > 0) {
    const userModules = modules.map(m => ({
      user_id: userId,
      module_id: m.id,
      status: 'completed',
      progress_percent: 100,
      completed_at: new Date().toISOString()
    }))
    await authenticatedClient.from('user_modules').upsert(userModules, { onConflict: 'user_id,module_id' })
  }

  // Lengkapi badges
  const { data: badges } = await authenticatedClient.from('badges').select('id')
  if (badges && badges.length > 0) {
    const userBadges = badges.map(b => ({
      user_id: userId,
      badge_id: b.id
    }))
    await authenticatedClient.from('user_badges').upsert(userBadges, { onConflict: 'user_id,badge_id' })
  }

  // Lengkapi xp logs
  await authenticatedClient.from('xp_logs').insert([
    { user_id: userId, xp_amount: 5000, reason: 'Grandmaster Module Completion Bundle' },
    { user_id: userId, xp_amount: 3000, reason: 'Champion PvP Battle Arena Streak' },
    { user_id: userId, xp_amount: 2000, reason: `Special Account Boost ${targetXp} XP` }
  ])

  console.log(`[Seed] Sukses! Akun ${email} sekarang memiliki ${targetXp} XP (Level ${level})`)
  return profileData?.[0]
}

if (process.argv[1]?.endsWith('seed-boost-account.mjs')) {
  seedBoostAccount().catch(console.error)
}
