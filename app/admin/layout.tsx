'use client'

import {
    GridDots24Regular,
    Person24Regular,
    Building24Regular,
    SignOut24Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import styles from './adminLayout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    CV Admin
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navItem}>
                        <GridDots24Regular />
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className={styles.navItem}>
                        <Person24Regular />
                        Users
                    </Link>
                    <Link href="/admin/companies" className={styles.navItem}>
                        <Building24Regular />
                        Companies
                    </Link>
                </nav>
                <div className={styles.footer}>
                    <Link href="/" className={styles.navItem}>
                        <SignOut24Regular />
                        Back to App
                    </Link>
                </div>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
