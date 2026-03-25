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

const DEFAULT_DEMO_EMAIL = 'akundemo@skillungo.com'
const DEFAULT_DEMO_PASSWORD = 'siswa123'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || DEFAULT_DEMO_EMAIL
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || DEFAULT_DEMO_PASSWORD

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
    }

    const fillDemoCredentials = () => {
        setError(null)
        setValue('email', demoEmail, { shouldValidate: true, shouldDirty: true })
        setValue('password', demoPassword, { shouldValidate: true, shouldDirty: true })
    }

    const handleDemoLogin = async () => {
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
