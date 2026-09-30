'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

interface DashboardShellWrapperProps {
    children: React.ReactNode
}

export default function DashboardShellWrapper({ children }: DashboardShellWrapperProps) {
    const pathname = usePathname()
    // Deteksi apakah sedang berada di layar aktif pertarungan (1v1 duel room atau vs computer)
    const isLiveBattle = pathname?.startsWith('/battle/') && pathname !== '/battle'

    return (
        <div
            className={`dashboard-shell ${isLiveBattle ? 'in-live-battle' : ''}`}
            style={{ display: 'flex', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}
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
