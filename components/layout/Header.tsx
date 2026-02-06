'use client'

import { Navigation } from './Navigation'
import { SearchInput } from './SearchInput'
import styles from './AppLayout.module.css'
import Link from 'next/link'

export function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.leftZone}>
                    <Link href="/" className={styles.logo}>
                        <h1>ChainVerse</h1>
                        <span>Supply Chain Network</span>
                    </Link>
                </div>

                <div className={styles.centerZone}>
                    <SearchInput />
                </div>

                <div className={styles.rightZone}>
                    <Navigation />
                </div>
            </div>
        </header>
    )
}
