'use client'

import {
    PeopleTeam24Regular,
    Person24Regular,
    Calendar24Regular,
    News24Regular,
    Dismiss16Regular,
    PersonAdd24Regular
} from '@fluentui/react-icons'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { ConnectionCard } from '@/components/network/ConnectionCard'
import styles from './network.module.css'

export default function NetworkPage() {
    const { data: session, status } = useSession()
    const [invitations, setInvitations] = useState<any[]>([])
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [stats, setStats] = useState({
        connections: 0,
        groups: 0,
        events: 0,
        newsletters: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    const fetchNetworkData = async () => {
        setIsLoading(true)
        try {
            // Fetch invitations
            const invRes = await fetch('/api/connections?type=pending')
            const invData = await invRes.json()
            if (Array.isArray(invData)) setInvitations(invData)

            // Fetch suggestions
            const sugRes = await fetch('/api/recommendations/users')
            const sugData = await sugRes.json()
            if (Array.isArray(sugData)) setSuggestions(sugData)

            // Fetch stats (connections count)
            const connRes = await fetch('/api/connections?type=accepted')
            const connData = await connRes.json()

            // Fetch analytics for connection count specifically if possible, 
            // or just use length of accepted connections
            // Fetch newsletters count
            const newsRes = await fetch('/api/newsletters/subscribed')
            const newsData = await newsRes.json()

            setStats(prev => ({
                ...prev,
                connections: Array.isArray(connData) ? connData.length : 0,
                newsletters: Array.isArray(newsData) ? newsData.length : 0
            }))

        } catch (error) {
            console.error('Failed to fetch network data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login')
        }
        if (status === 'authenticated') {
            fetchNetworkData()
        }
    }, [status])

    if (status === 'loading' || isLoading) {
        return <div className={styles.loading}>Loading Network...</div>
    }

    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                    <div className={styles.sidebarHeader}>
                        Manage my network
                    </div>
                    <div className={styles.sidebarMenu}>
                        <Link href="/mynetwork" className={styles.sidebarItem}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                                <PeopleTeam24Regular />
                                <span>Connections</span>
                            </div>
                            <span className={styles.count}>{stats.connections}</span>
                        </Link>
                        <Link href="/network/following" className={styles.sidebarItem}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                                <Person24Regular />
                                <span>Following & followers</span>
                            </div>
                        </Link>
                        <Link href="/network/groups" className={styles.sidebarItem}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                                <PeopleTeam24Regular />
                                <span>Groups</span>
                            </div>
                            <span className={styles.count}>{stats.groups}</span>
                        </Link>
                        <Link href="/events" className={styles.sidebarItem}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                                <Calendar24Regular />
                                <span>Events</span>
                            </div>
                            <span className={styles.count}>{stats.events}</span>
                        </Link>
                        <Link href="/news" className={styles.sidebarItem}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                                <News24Regular />
                                <span>Industry News</span>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Link href="#" className={styles.footerLink}>About</Link>
                    <Link href="#" className={styles.footerLink}>Accessibility</Link>
                    <Link href="#" className={styles.footerLink}>Help Center</Link>
                    <div className={styles.copyright}>ChainVerse Corporation © 2026</div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.main}>
                {/* Invitations Section */}
                {invitations.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Invitations ({invitations.length})</h2>
                            <Link href="/mynetwork" className={styles.seeAll}>See Manage</Link>
                        </div>
                        <div className={styles.invitationList}>
                            {invitations.map(invite => (
                                <ConnectionCard
                                    key={invite.id}
                                    connectionId={invite.id}
                                    user={invite.user}
                                    status={invite.status}
                                    isRequester={invite.isRequester}
                                    onUpdate={fetchNetworkData}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggestions Section */}
                <div className={styles.card}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>People you may know</h2>
                    </div>
                    {suggestions.length === 0 ? (
                        <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                            Searching for more professionals in your industry...
                        </div>
                    ) : (
                        <div className={styles.suggestionGrid}>
                            {suggestions.map(person => (
                                <div key={person.id} className={styles.suggestionCard}>
                                    <div className={styles.banner}></div>
                                    <button
                                        className={styles.closeButton}
                                        onClick={() => setSuggestions(prev => prev.filter(s => s.id !== person.id))}
                                    >
                                        <Dismiss16Regular />
                                    </button>
                                    <div className={styles.suggestionContent}>
                                        <div className={styles.suggestionAvatar}>
                                            <Avatar name={person.name} size="large" />
                                        </div>
                                        <div className={styles.suggestionName}>{person.name}</div>
                                        <div className={styles.suggestionRole}>{person.role || person.industry || 'Supply Chain Professional'}</div>

                                        <button
                                            className={styles.connectButton}
                                            onClick={async () => {
                                                await fetch('/api/connections', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ receiverId: person.id })
                                                });
                                                setSuggestions(prev => prev.filter(s => s.id !== person.id));
                                            }}
                                        >
                                            <PersonAdd24Regular style={{ marginRight: 'var(--space-sm)', width: '20px', height: '20px', verticalAlign: 'middle' }} />
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
