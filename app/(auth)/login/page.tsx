'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Swords, Mail, Lock, Loader2 } from 'lucide-react'

const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || ''
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || ''

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
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

        router.push('/dashboard')
        router.refresh()
    }

    const handleGoogleLogin = async () => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    const fillDemoCredentials = () => {
        if (!demoEmail || !demoPassword) {
            setError('Akun demo belum dikonfigurasi.')
            return
        }
        setError(null)
        setValue('email', demoEmail, { shouldValidate: true, shouldDirty: true })
        setValue('password', demoPassword, { shouldValidate: true, shouldDirty: true })
    }

    const handleDemoLogin = async () => {
        if (!demoEmail || !demoPassword) {
            setError('Akun demo belum dikonfigurasi.')
            return
        }
        await onSubmit({ email: demoEmail, password: demoPassword })
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%', maxWidth: '400px' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Swords size={32} style={{ color: 'var(--accent-gold)' }} />
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                            Skillungo
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Masuk ke petualangan belajarmu</p>
                </div>

                {/* Form Card */}
                <div className="card auth-card" style={{ padding: '32px' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Login</h1>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(232,64,64,0.1)', border: '1px solid var(--accent-red)', borderRadius: '4px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: 'var(--accent-red)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label htmlFor="login-email" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    id="login-email"
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="hero@skillquest.id"
                                    aria-invalid={Boolean(errors.email)}
                                    style={{
                                        width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                                        backgroundColor: 'var(--bg-tertiary)', border: `1px solid ${errors.email ? 'var(--accent-red)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                                    }}
                                />
                            </div>
                            {errors.email && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="login-password" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    id="login-password"
                                    {...register('password')}
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    aria-invalid={Boolean(errors.password)}
                                    style={{
                                        width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                                        backgroundColor: 'var(--bg-tertiary)', border: `1px solid ${errors.password ? 'var(--accent-red)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                                    }}
                                />
                            </div>
                            {errors.password && <p style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '4px' }}>{errors.password.message}</p>}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%', padding: '12px',
                                backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
                                border: 'none', borderRadius: '4px', fontFamily: 'var(--font-heading)',
                                fontSize: '15px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}
                        >
                            {isLoading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memuat...</> : 'MASUK'}
                        </motion.button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ATAU</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                    </div>

                    <motion.button
                        type="button"
                        aria-label="Lanjutkan dengan Google"
                        onClick={handleGoogleLogin}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: '100%', padding: '12px',
                            backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                            border: '1px solid var(--border)', borderRadius: '4px',
                            fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Lanjutkan dengan Google
                    </motion.button>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Belum punya akun?{' '}
                        <Link href="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}>
                            Daftar sekarang
                        </Link>
                    </p>

                    <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={fillDemoCredentials}
                            style={{
                                padding: '9px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            Isi Akun Demo
                        </button>
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                            style={{
                                padding: '9px 10px',
                                borderRadius: '4px',
                                border: '1px solid rgba(34,197,94,0.35)',
                                backgroundColor: 'rgba(34,197,94,0.12)',
                                color: 'var(--accent-green)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                fontSize: '12px',
                                fontWeight: 700,
                            }}
                        >
                            Masuk Akun Demo (juri)
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
