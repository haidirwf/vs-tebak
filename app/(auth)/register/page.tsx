'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Swords, Mail, Lock, User, School, Loader2 } from 'lucide-react'

const registerSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    username: z.string().min(3, 'Username minimal 3 karakter').max(20, 'Maksimal 20 karakter')
        .regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore'),
    full_name: z.string().min(2, 'Nama minimal 2 karakter'),
    school_name: z.string().min(3, 'Nama sekolah minimal 3 karakter'),
    city: z.string().min(2, 'Nama kota minimal 2 karakter'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    username: data.username,
                    full_name: data.full_name,
                    school_name: data.school_name,
                    city: data.city,
                },
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setIsLoading(false)
            return
        }

        // Jika Supabase belum mengembalikan session aktif, coba sign-in langsung
        if (!authData.session) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })
            if (signInError && signInError.message.toLowerCase().includes('email not confirmed')) {
                setError('Registrasi berhasil! Silakan periksa inbox email kamu untuk konfirmasi akun.')
                setIsLoading(false)
                return
            }
        }

        // Upsert profil (trigger database handle_new_user juga otomatis membuatnya)
        if (authData.user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: authData.user.id,
                username: data.username,
                full_name: data.full_name,
                school_name: data.school_name,
                city: data.city,
                character_created: false,
            }, { onConflict: 'id' })

            if (profileError) {
                // Abaikan error RLS jika trigger database sudah berhasil membuat row
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', authData.user.id)
                    .maybeSingle()

                if (!existingProfile) {
                    console.error("Supabase Profile Upsert Error:", profileError)
                    setError(`Gagal membuat profil. Detail: ${profileError.message}`)
                    setIsLoading(false)
                    return
                }
            }
        }

        window.location.href = '/dashboard'
    }

    const inputStyle = (hasError?: boolean) => ({
        width: '100%',
        paddingLeft: '38px',
        paddingRight: '12px',
        paddingTop: '10px',
        paddingBottom: '10px',
        backgroundColor: 'var(--surface-elevated)',
        border: `1px solid ${hasError ? '#ff3355' : 'var(--surface-border)'}`,
        borderRadius: '12px',
        color: 'var(--text-primary)',
        fontSize: '13px',
        outline: 'none',
        transition: 'border-color 0.2s',
    })

    const labelStyle = {
        display: 'block',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        marginBottom: '6px',
        fontWeight: 500,
    }

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--surface-canvas)',
                backgroundImage: 'radial-gradient(ellipse at 50% 10%, rgba(245, 197, 66, 0.08), transparent 60%)',
                padding: 'clamp(14px, 3vh, 28px) 16px',
                boxSizing: 'border-box',
                overflowX: 'hidden',
                overflowY: 'auto',
                width: '100%',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ width: '100%', maxWidth: '460px', margin: 'auto 0' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(14px, 2.5vh, 22px)' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '6px', textDecoration: 'none' }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                                border: '1px solid #F59E0B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                            }}
                        >
                            <Swords
                                size={18}
                                style={{
                                    color: '#ffffff',
                                    filter: 'drop-shadow(0 1px 1px rgba(180, 83, 9, 0.4))',
                                }}
                            />
                        </div>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                            Skill<span
                                style={{
                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 700,
                                }}
                            >
                                ungo
                            </span>
                        </span>
                    </Link>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', margin: 0 }}>Mulai petualangan belajarmu hari ini</p>
                </div>

                <div
                    className="card auth-card"
                    style={{
                        padding: 'clamp(20px, 4vw, 32px)',
                        borderRadius: '16px',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '18px', color: 'var(--text-primary)' }}>
                        Buat Akun
                    </h1>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(255, 51, 85, 0.08)', border: '1px solid rgba(255, 51, 85, 0.3)', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px', fontSize: '12.5px', color: '#ff3355' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Email */}
                        <div>
                            <label htmlFor="register-email" style={labelStyle}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input id="register-email" {...register('email')} type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} placeholder="hero@skillquest.id" style={inputStyle(!!errors.email)} />
                            </div>
                            {errors.email && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '4px' }}>{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="register-password" style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input id="register-password" {...register('password')} type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} placeholder="••••••••" style={inputStyle(!!errors.password)} />
                            </div>
                            {errors.password && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '4px' }}>{errors.password.message}</p>}
                        </div>

                        {/* Username & Full Name */}
                        <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label htmlFor="register-username" style={labelStyle}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input id="register-username" {...register('username')} autoComplete="username" aria-invalid={Boolean(errors.username)} placeholder="hero123" style={inputStyle(!!errors.username)} />
                                </div>
                                {errors.username && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '4px' }}>{errors.username.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="register-full-name" style={labelStyle}>Nama Lengkap</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input id="register-full-name" {...register('full_name')} autoComplete="name" aria-invalid={Boolean(errors.full_name)} placeholder="Budi Santoso" style={inputStyle(!!errors.full_name)} />
                                </div>
                                {errors.full_name && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '4px' }}>{errors.full_name.message}</p>}
                            </div>
                        </div>

                        {/* School & City */}
                        <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label htmlFor="register-school-name" style={labelStyle}>Nama Sekolah</label>
                                <div style={{ position: 'relative' }}>
                                    <School size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input id="register-school-name" {...register('school_name')} aria-invalid={Boolean(errors.school_name)} placeholder="SMK N 1 Jakarta" style={inputStyle(!!errors.school_name)} />
                                </div>
                                {errors.school_name && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '4px' }}>{errors.school_name.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="register-city" style={labelStyle}>Kota</label>
                                <div style={{ position: 'relative' }}>
                                    <School size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                    <input id="register-city" {...register('city')} autoComplete="address-level2" aria-invalid={Boolean(errors.city)} placeholder="Jakarta" style={inputStyle(!!errors.city)} />
                                </div>
                                {errors.city && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '4px' }}>{errors.city.message}</p>}
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            style={{
                                width: '100%',
                                padding: '13px',
                                marginTop: '10px',
                                backgroundColor: 'var(--brand-primary)',
                                color: 'var(--brand-primary-text)',
                                border: 'none',
                                borderRadius: '10px',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '14px',
                                fontWeight: 600,
                                letterSpacing: '0.01em',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: 'var(--shadow-card)',
                            }}
                        >
                            {isLoading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Mendaftar...</> : 'Mulai Petualangan'}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Sudah punya akun?{' '}
                        <Link href="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>
                            Masuk sekarang
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
