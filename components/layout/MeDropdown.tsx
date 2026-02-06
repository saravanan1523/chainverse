'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar } from '../ui/Avatar'
import {
    SignOut24Regular,
    WeatherMoon24Regular,
    WeatherSunny24Regular,
    Play24Regular,
    ArrowTrending24Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import styles from './MeDropdown.module.css'

export function MeDropdown() {
    const { data: session } = useSession()
    const { theme, toggleTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    if (!session?.user) return null

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User Menu"
            >
                <div className={styles.avatarWrapper}>
                    <Avatar
                        name={session.user.name || 'User'}
                        size="small"
                    />
                </div>
                <div className={styles.labelRow}>
                    <span className={styles.label}>Me</span>
                    <span className={styles.arrow}>▼</span>
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className={styles.backdrop}
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={styles.dropdown}>
                        <div className={styles.header}>
                            <div className={styles.userInfo}>
                                <Avatar
                                    name={session.user.name || 'User'}
                                    size="medium"
                                />
                                <div className={styles.userDetails}>
                                    <span className={styles.userName}>{session.user.name}</span>
                                    <span className={styles.userRole}>{session.user.role}</span>
                                </div>
                            </div>
                            <Link
                                href={`/profile/${session.user.id}`}
                                className={styles.viewProfile}
                                onClick={() => setIsOpen(false)}
                            >
                                View Profile
                            </Link>
                        </div>

                        <div className={styles.menu}>
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Account</h4>
                                <Link
                                    href="/settings"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Settings & Privacy
                                </Link>
                                <Link
                                    href="/ai"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    AI Assistant
                                </Link>
                                <button
                                    className={styles.menuItem}
                                    onClick={() => { toggleTheme(); setIsOpen(false); }}
                                >
                                    {theme === 'light' ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
                                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                                </button>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Manage</h4>
                                <Link
                                    href="/groups"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    My Groups
                                </Link>
                                <Link
                                    href="/newsletters"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Newsletters
                                </Link>
                                <Link
                                    href="/events"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Events
                                </Link>
                                <Link
                                    href="/saved"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Saved Items
                                </Link>
                                <Link
                                    href="/companies"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Company Page
                                </Link>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Professional</h4>
                                <Link
                                    href="/masterclasses"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Play24Regular />
                                    Masterclass
                                </Link>
                                <Link
                                    href="/tools"
                                    className={styles.menuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <ArrowTrending24Regular />
                                    Supply Chain Tools
                                </Link>
                            </div>
                            <div className={styles.divider} />
                            <button
                                className={styles.signOutBtn}
                                onClick={() => signOut()}
                            >
                                <SignOut24Regular />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
