'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'
import { UserProfileCard } from '../profile/UserProfileCard'
import { TrendingSection } from '../trending/TrendingSection'
import { TrendingTags } from '../tags/TrendingTags'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
    children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const { data: session } = useSession()
    const pathname = usePathname()

    return (
        <div className={styles.layout}>
            {/* Top Navigation Bar */}
            <Header />

            <div className={styles.container}>
                {/* Left Sidebar (Nav + Profile) */}
                <aside className={styles.sidebar}>
                    <div style={{ padding: 'var(--space-md) 0' }}>
                        <UserProfileCard />
                    </div>
                </aside>

                {/* Main Feed */}
                <main className={styles.main}>
                    {children}
                </main>

                {/* Right Sidebar (Trending) - Hide on messaging page */}
                {!pathname?.startsWith('/messaging') && (
                    <aside className={styles.rightSidebar}>
                        <div style={{ padding: 'var(--space-md) 0' }}>
                            <TrendingSection />
                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <TrendingTags />
                            </div>
                        </div>
                    </aside>
                )}
            </div>
            <BottomNavigation />
        </div>
    )
}
