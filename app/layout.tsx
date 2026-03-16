import type { Metadata } from 'next'
import { DM_Sans, Rajdhani } from 'next/font/google'
import './globals.css'

const headingFont = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Skillungo — Level Up Your Skills, Conquer Your Future',
  description: 'Platform edukasi berbasis RPG untuk pelajar SMK/SMA Indonesia. Belajar skill digital, battle quiz 1v1, dan kompetisi leaderboard antar sekolah.',
  keywords: 'edukasi, gamified learning, RPG, SMK, SMA, Indonesia, coding, desain, produktivitas',
  openGraph: {
    title: 'Skillungo',
    description: 'Level Up Your Skills, Conquer Your Future',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const judgeMode = process.env.NEXT_PUBLIC_JUDGE_MODE === 'true'
  return (
    <html lang="id">
      <body className={`${headingFont.variable} ${bodyFont.variable}${judgeMode ? ' judge-mode' : ''}`}>{children}</body>
    </html>
  )
}
