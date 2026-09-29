'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Flame, Mail, Lock, Loader2 } from 'lucide-react'

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
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                backgroundImage: 'radial-gradient(ellipse at 50% 10%, rgba(245, 197, 66, 0.08), transparent 60%)',
                padding: '24px',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%', maxWidth: '420px' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, #F5C542, #EAB308)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 16px rgba(245, 197, 66, 0.4)',
                            }}
                        >
                            <Flame size={20} color="#000000" />
                        </div>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 400, letterSpacing: '-0.01em', color: '#ffffff' }}>
                            Skillungo
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Masuk ke studio petualangan belajarmu</p>
                </div>

                {/* Form Card */}
                <div
                    className="card auth-card"
                    style={{
                        padding: '36px',
                        borderRadius: '17.1429px',
                        backgroundColor: '#080808',
                        border: '1px solid #292929',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                    }}
                >
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '24px', color: '#ffffff' }}>
                        Login
                    </h1>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(255, 51, 85, 0.08)', border: '1px solid rgba(255, 51, 85, 0.3)', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', fontSize: '13px', color: '#ff3355' }}>
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
                                        backgroundColor: '#121212',
                                        border: `1px solid ${errors.email ? '#ff3355' : '#292929'}`,
                                        borderRadius: '12px',
                                        color: '#ffffff',
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
                                        backgroundColor: '#121212',
                                        border: `1px solid ${errors.password ? '#ff3355' : '#292929'}`,
                                        borderRadius: '12px',
                                        color: '#ffffff',
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
                            style={{
                                width: '100%',
                                padding: '13px',
                                backgroundColor: '#F5C542',
                                color: '#0a0a0a',
                                border: 'none',
                                borderRadius: '9999px',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '14px',
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 0 18px rgba(245, 197, 66, 0.4)',
                                marginTop: '6px',
                            }}
                        >
                            {isLoading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memuat...</> : 'MASUK'}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Belum punya akun?{' '}
                        <Link href="/register" style={{ color: '#F5C542', textDecoration: 'none', fontWeight: 500 }}>
                            Daftar sekarang
                        </Link>
                    </p>

                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={fillDemoCredentials}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '9999px',
                                border: '1px solid #292929',
                                backgroundColor: '#141414',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                            }}
                        >
                            Isi Akun Demo
                        </button>
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '9999px',
                                border: '1px solid rgba(8, 195, 128, 0.3)',
                                backgroundColor: 'rgba(8, 195, 128, 0.1)',
                                color: '#08c380',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                fontSize: '12px',
                                fontWeight: 600,
                                transition: 'all 0.2s',
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
