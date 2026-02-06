'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home24Regular,
    Home24Filled,
    PeopleTeam24Regular,
    PeopleTeam24Filled,
    Briefcase24Regular,
    Briefcase24Filled,
    Person24Regular,
    Person24Filled,
    ArrowTrending24Regular,
    ArrowTrending24Filled,
    Play24Regular,
    Play24Filled,
    Document24Regular,
    Chat24Regular,
    Chat24Filled,
    PeopleCommunity24Regular,
    PeopleCommunity24Filled,
    News24Regular,
    News24Filled,
    Calendar24Regular,
    Calendar24Filled
} from '@fluentui/react-icons'
import { NotificationDropdown } from '../notifications/NotificationDropdown'
import { MessagingPanel } from '../messaging/MessagingPanel'
import { MeDropdown } from './MeDropdown'
import styles from './Navigation.module.css'

export function Navigation() {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'Home',
            href: '/',
            iconRegular: Home24Regular,
            iconFilled: Home24Filled,
        },
        {
            name: 'My Network',
            href: '/network',
            iconRegular: PeopleTeam24Regular,
            iconFilled: PeopleTeam24Filled,
        },
        {
            name: 'Jobs',
            href: '/jobs',
            iconRegular: Briefcase24Regular,
            iconFilled: Briefcase24Filled,
        },
    ]

    return (
        <nav className={styles.nav}>
            {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = isActive ? item.iconFilled : item.iconRegular

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <Icon />
                        <span>{item.name}</span>
                    </Link>
                )
            })}

            <MessagingPanel />
            <NotificationDropdown />
            <MeDropdown />
        </nav>
    )
}
