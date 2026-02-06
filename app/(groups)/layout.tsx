'use client'

import { Header } from '@/components/layout/Header'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import styles from './GroupsLayout.module.css'

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.main}>
                {children}
            </main>
            <BottomNavigation />
        </div>
    )
}
