import PageTransition from '@/components/layout/PageTransition'

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
    return <PageTransition>{children}</PageTransition>
}
