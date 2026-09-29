import { getAuthenticatedUser } from '@/lib/auth/get-user'
import LandingClient from '@/components/landing/LandingClient'

export default async function LandingPage() {
  const user = await getAuthenticatedUser()
  const isLoggedIn = !!user

  return <LandingClient isLoggedIn={isLoggedIn} />
}
