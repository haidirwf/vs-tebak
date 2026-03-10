// app/(dashboard)/focus/page.tsx
'use client'

import FocusTimer from '@/components/dashboard/FocusTimer'
import MotivationQuote from '@/components/dashboard/MotivationQuote'

export default function FocusPage() {
    return (
        <div className="responsive-page focus-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
                    ⚡ Zona Fokus
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Tingkatkan konsentrasi dengan teknik Pomodoro.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
                {/* Motivation Quote at the top of focus zone */}
                <MotivationQuote />

                {/* Main Focus Timer */}
                <FocusTimer />

                {/* Info Card */}
                <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border)' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                        Tentang Zona Fokus
                    </h3>
                    <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <li>Gunakan sesi 25 menit untuk belajar atau bekerja tanpa gangguan.</li>
                        <li>Teknik ini membantu mencegah kelelahan mental dan menjaga produktivitas.</li>
                        <li>Setiap sesi yang selesai akan dapat <strong>+20 XP</strong>.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
