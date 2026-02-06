'use client'

import {
    Home24Regular,
    PeopleTeam24Regular,
    Briefcase24Regular,
    Person24Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from './bottomNavigation.module.css'

export function BottomNavigation() {
    const pathname = usePathname()
    const { data: session } = useSession()

    // Only show on main routes
    if (pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/signup') return null

    const isActive = (path: string) => pathname === path

    return (
        <nav className={styles.bottomNav}>
            <Link href="/" className={`${styles.item} ${isActive('/') ? styles.active : ''}`}>
                <Home24Regular />
                <span>Home</span>
            </Link>
            <Link href="/network" className={`${styles.item} ${isActive('/network') ? styles.active : ''}`}>
                <PeopleTeam24Regular />
                <span>Network</span>
            </Link>
            <Link href="/jobs" className={`${styles.item} ${isActive('/jobs') ? styles.active : ''}`}>
                <Briefcase24Regular />
                <span>Jobs</span>
            </Link>
            <Link href={`/profile/${session?.user?.id}`} className={`${styles.item} ${isActive(`/profile/${session?.user?.id}`) ? styles.active : ''}`}>
                <Person24Regular />
                <span>Profile</span>
            </Link>
        </nav>
    )
}
