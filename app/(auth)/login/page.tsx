'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Swords, Mail, Lock, Loader2, LogIn, ChevronRight } from 'lucide-react'

const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (authError) {
            setError(authError.message === 'Invalid login credentials'
                ? 'Email atau password salah'
                : authError.message)
            setIsLoading(false)
            return
        }

        window.location.href = '/dashboard'
    }

    return (
        <div
            style={{
                minHeight: '100dvh',
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--surface-canvas)',
                backgroundImage: 'radial-gradient(ellipse at 50% 10%, rgba(245, 197, 66, 0.08), transparent 60%)',
                padding: 'clamp(14px, 3vh, 24px) 16px',
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
                style={{ width: '100%', maxWidth: '400px', margin: 'auto 0' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(14px, 2.5vh, 24px)' }}>
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
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', margin: 0 }}>Masuk ke studio petualangan belajarmu</p>
                </div>

                {/* Form Card */}
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
                        Login
                    </h1>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(255, 51, 85, 0.08)', border: '1px solid rgba(255, 51, 85, 0.3)', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px', fontSize: '12.5px', color: '#ff3355' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label htmlFor="login-email" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    id="login-email"
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="hero@skillquest.id"
                                    aria-invalid={Boolean(errors.email)}
                                    style={{
                                        width: '100%',
                                        paddingLeft: '40px',
                                        paddingRight: '14px',
                                        paddingTop: '11px',
                                        paddingBottom: '11px',
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: `1px solid ${errors.email ? '#ff3355' : 'var(--surface-border)'}`,
                                        borderRadius: '12px',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                    }}
                                />
                            </div>
                            {errors.email && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '5px' }}>{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="login-password" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    id="login-password"
                                    {...register('password')}
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    aria-invalid={Boolean(errors.password)}
                                    style={{
                                        width: '100%',
                                        paddingLeft: '40px',
                                        paddingRight: '14px',
                                        paddingTop: '11px',
                                        paddingBottom: '11px',
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: `1px solid ${errors.password ? '#ff3355' : 'var(--surface-border)'}`,
                                        borderRadius: '12px',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                    }}
                                />
                            </div>
                            {errors.password && <p style={{ color: '#ff3355', fontSize: '11px', marginTop: '5px' }}>{errors.password.message}</p>}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="btn-signal-orange"
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '13.5px',
                                fontWeight: 700,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                marginTop: '6px',
                            }}
                        >
                            {isLoading ? (
                                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memuat...</>
                            ) : (
                                <><LogIn size={15} /> Masuk ke Studio <ChevronRight size={14} /></>
                            )}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Belum punya akun?{' '}
                        <Link href="/register" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
