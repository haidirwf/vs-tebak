'use client'

import React, { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

interface DashboardShellWrapperProps {
    children: React.ReactNode
}

export default function DashboardShellWrapper({ children }: DashboardShellWrapperProps) {
    const pathname = usePathname()
    const contentRef = useRef<HTMLElement>(null)
    // Deteksi apakah sedang berada di layar aktif pertarungan (1v1 duel room atau vs computer)
    const isLiveBattle = pathname?.startsWith('/battle/') && pathname !== '/battle'

    // Reset scroll saat rute berganti agar tidak ada glitch "fullscreen" / navbar hilang
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0)
        }
        if (contentRef.current) {
            contentRef.current.scrollTo(0, 0)
        }
    }, [pathname])

    return (
        <div
            className={`dashboard-shell ${isLiveBattle ? 'in-live-battle' : ''}`}
            style={{ display: 'flex', minHeight: '100dvh', height: '100dvh', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}
        >
            <Sidebar />
            <div
                className="dashboard-main"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                }}
            >
                <div className="dashboard-topbar">
                    <Navbar />
                </div>
                <main
                    ref={contentRef}
                    className="dashboard-content"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        minWidth: 0,
                        width: '100%',
                        maxWidth: '100%',
                        backgroundColor: 'var(--bg-primary)',
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    )
}
