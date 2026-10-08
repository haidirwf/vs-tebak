'use client'

import React, { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'

interface DashboardShellWrapperProps {
    children: React.ReactNode
}

export default function DashboardShellWrapper({ children }: DashboardShellWrapperProps) {
    const pathname = usePathname()
    const contentRef = useRef<HTMLElement>(null)
    // Deteksi apakah sedang berada di layar aktif pertarungan atau mode player modul
    const isLiveBattle = pathname?.startsWith('/battle/') && pathname !== '/battle'
    const isModuleLearning = pathname?.startsWith('/modules/') && pathname !== '/modules'
    const isFocusedMode = isLiveBattle || isModuleLearning

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
        <div className={`dashboard-shell ${isLiveBattle ? 'in-live-battle' : ''} ${isModuleLearning ? 'in-learning-mode' : ''}`}>
            {!isFocusedMode && <Sidebar />}
            <div className="dashboard-main">
                {!isFocusedMode && (
                    <div className="dashboard-topbar">
                        <Topbar />
                    </div>
                )}
                <main ref={contentRef} className="dashboard-content">
                    {children}
                </main>
            </div>
            {!isFocusedMode && <Navbar />}
        </div>
    )
}
