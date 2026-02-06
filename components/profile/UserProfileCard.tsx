'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import styles from './userProfileCard.module.css'

export function UserProfileCard() {
    const { data: session } = useSession()

    if (!session?.user) return null

    const userInitial = session.user.name?.charAt(0).toUpperCase() || 'U'

    return (
        <div className={styles.card}>
            {/* Cover Background */}
            <div className={styles.cover} />

            {/* Avatar */}
            <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                    {userInitial}
                </div>
            </div>

            {/* User Info */}
            <Link href="/profile" className={styles.userInfo}>
                <h3 className={styles.userName}>{session.user.name}</h3>
                <p className={styles.userRole}>{session.user.role || 'Supply Chain Professional'}</p>
            </Link>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Profile viewers</span>
                    <span className={styles.statValue}>9</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Connections</span>
                    <span className={styles.statValue}>260</span>
                </div>
            </div>

            {/* Premium Banner */}
            <div className={styles.premium}>
                <p className={styles.premiumText}>Achieve 4x more profile visits</p>
                <Link href="/profile" className={styles.premiumLink}>
                    <span className={styles.premiumIcon}>◆</span>
                    <span>Reactivate Premium: 50% Off</span>
                </Link>
            </div>
        </div>
    )
}
