import { getAuthenticatedUser } from '@/lib/auth/get-user'
import LandingClient from '@/components/landing/LandingClient'
import PageTransition from '@/components/layout/PageTransition'

export default async function LandingPage() {
  const user = await getAuthenticatedUser()
  const isLoggedIn = !!user

  return (
    <PageTransition>
      <LandingClient isLoggedIn={isLoggedIn} />
    </PageTransition>
  )
}
