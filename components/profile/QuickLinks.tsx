'use client'

import Link from 'next/link'
import {
    Bookmark24Regular,
    People24Regular,
    Mail24Regular,
    Calendar24Regular
} from '@fluentui/react-icons'
import styles from './quickLinks.module.css'

const links = [
    { icon: Bookmark24Regular, label: 'Saved items', href: '/saved' },
    { icon: People24Regular, label: 'Groups', href: '/groups' },
    { icon: Mail24Regular, label: 'Newsletters', href: '/newsletters' },
    { icon: Calendar24Regular, label: 'Events', href: '/events' },
]

export function QuickLinks() {
    return (
        <div className={styles.card}>
            <nav className={styles.links}>
                {links.map((link) => {
                    const Icon = link.icon
                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={styles.link}
                        >
                            <Icon className={styles.icon} />
                            <span>{link.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
