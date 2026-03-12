import type { Metadata } from 'next'
import './globals.css'

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
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
