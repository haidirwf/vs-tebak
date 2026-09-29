import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-acidgrotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Skillungo — Level Up Your Skills, Conquer Your Future',
  description: 'Platform edukasi berbasis RPG untuk pelajar SMK/SMA Indonesia. Belajar skill digital, duel kuis 1v1, dan raih prestasi di leaderboard sekolah.',
  keywords: 'edukasi, gamified learning, RPG, SMK, SMA, Indonesia, coding, desain, produktivitas',
  openGraph: {
    title: 'Skillungo',
    description: 'Level Up Your Skills, Conquer Your Future',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}${judgeMode ? ' judge-mode' : ''}`}>{children}</body>
    </html>
  )
}
