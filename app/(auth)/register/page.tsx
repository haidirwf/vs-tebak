'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { AVATAR_CLASS_STATS } from '@/lib/game/xp'
import { AvatarClass } from '@/types'
import { Swords, Mail, Lock, User, School, Loader2 } from 'lucide-react'

const registerSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    username: z.string().min(3, 'Username minimal 3 karakter').max(20, 'Maksimal 20 karakter')
        .regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore'),
    full_name: z.string().min(2, 'Nama minimal 2 karakter'),
    school_name: z.string().min(3, 'Nama sekolah minimal 3 karakter'),
    city: z.string().min(2, 'Nama kota minimal 2 karakter'),
    avatar_class: z.enum(['warrior', 'mage', 'archer', 'healer']),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedClass, setSelectedClass] = useState<AvatarClass>('warrior')

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { avatar_class: 'warrior' },
    })

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })

        if (signUpError) {
            setError(signUpError.message)
            setIsLoading(false)
            return
        }

        if (authData.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: authData.user.id,
                username: data.username,
                full_name: data.full_name,
                school_name: data.school_name,
                city: data.city,
                avatar_class: data.avatar_class,
            })

            if (profileError) {
                console.error("Supabase Profile Insert Error:", profileError)
                setError(`Gagal membuat profil. Detail: ${profileError.message}`)
                setIsLoading(false)
                return
            }
        }

        router.push('/dashboard')
        router.refresh()
    }

    const inputStyle = (hasError?: boolean) => ({
        width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
        backgroundColor: 'var(--bg-tertiary)', border: `1px solid ${hasError ? 'var(--accent-red)' : 'var(--border)'}`,
        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    })

    const labelStyle = {
        display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500,
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '480px' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Swords size={28} style={{ color: 'var(--accent-gold)' }} />
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-gold)' }}>SkillQuest</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Mulai petualangan belajarmu hari ini</p>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Buat Akun</h1>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(232,64,64,0.1)', border: '1px solid var(--accent-red)', borderRadius: '4px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: 'var(--accent-red)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Avatar Class Selection */}
                        <div>
                            <label style={labelStyle}>Pilih Kelas Karaktermu</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {(Object.keys(AVATAR_CLASS_STATS) as AvatarClass[]).map((cls) => {
                                    const stat = AVATAR_CLASS_STATS[cls]
                                    const isSelected = selectedClass === cls
                                    return (
                                        <motion.button
                                            key={cls}
                                            type="button"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => { setSelectedClass(cls); setValue('avatar_class', cls) }}
                                            style={{
                                                padding: '10px 6px', borderRadius: '4px', cursor: 'pointer',
                                                backgroundColor: isSelected ? 'rgba(245,197,66,0.1)' : 'var(--bg-tertiary)',
                                                border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border)'}`,
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>{stat.emoji}</span>
                                            <span style={{
                                                fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700,
                                                color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                            }}>{stat.label}</span>
                                        </motion.button>
                                    )
                                })}
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                {AVATAR_CLASS_STATS[selectedClass].description}
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input {...register('email')} type="email" placeholder="hero@skillquest.id" style={inputStyle(!!errors.email)} />
                            </div>
                            {errors.email && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input {...register('password')} type="password" placeholder="••••••••" style={inputStyle(!!errors.password)} />
                            </div>
                            {errors.password && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.password.message}</p>}
                        </div>

                        {/* Username & Full Name */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input {...register('username')} placeholder="hero123" style={inputStyle(!!errors.username)} />
                                </div>
                                {errors.username && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.username.message}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Nama Lengkap</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input {...register('full_name')} placeholder="Budi Santoso" style={inputStyle(!!errors.full_name)} />
                                </div>
                                {errors.full_name && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.full_name.message}</p>}
                            </div>
                        </div>

                        {/* School & City */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Nama Sekolah</label>
                                <div style={{ position: 'relative' }}>
                                    <School size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input {...register('school_name')} placeholder="SMK N 1 Jakarta" style={inputStyle(!!errors.school_name)} />
                                </div>
                                {errors.school_name && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.school_name.message}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Kota</label>
                                <div style={{ position: 'relative' }}>
                                    <School size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input {...register('city')} placeholder="Jakarta" style={inputStyle(!!errors.city)} />
                                </div>
                                {errors.city && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.city.message}</p>}
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%', padding: '12px', marginTop: '8px',
                                backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
                                border: 'none', borderRadius: '4px', fontFamily: 'var(--font-heading)',
                                fontSize: '15px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}
                        >
                            {isLoading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Mendaftar...</> : 'MULAI PETUALANGAN'}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Sudah punya akun?{' '}
                        <Link href="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}>
                            Masuk sekarang
                        </Link>
                    </p>
                </div>
            </motion.div>
            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { border-color: var(--accent-gold) !important; box-shadow: 0 0 0 2px rgba(245,197,66,0.15); }
      `}</style>
        </div>
    )
}
