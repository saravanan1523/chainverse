'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { Mail24Regular, PeopleCommunity24Regular, News24Regular, Calendar24Regular, ChartPerson24Regular } from '@fluentui/react-icons'
import styles from '../newsletterProfile.module.css'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'

export default function NewsletterProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session } = useSession()
    const [newsletter, setNewsletter] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'archive' | 'dashboard'>('archive')

    const fetchNewsletter = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/newsletters/${id}`)
            if (res.ok) {
                const data = await res.json()
                setNewsletter(data)
            }
        } catch (error) {
            console.error('Failed to fetch newsletter details:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNewsletter()
    }, [id])

    const toggleSubscribe = async () => {
        try {
            const res = await fetch(`/api/newsletters/${id}/subscribe`, {
                method: 'POST'
            })
            if (res.ok) {
                fetchNewsletter()
            }
        } catch (error) {
            console.error('Failed to toggle subscription:', error)
        }
    }

    if (isLoading) return <div className={styles.loading}>Loading Newsletter...</div>
    if (!newsletter) return <div className={styles.loading}>Newsletter not found</div>

    const isOwner = newsletter.isOwner

    return (
        <div className={styles.container}>
            {/* Header / Banner area */}
            <div className={styles.header}>
                <Avatar name={newsletter.title} size="large" />
                <div>
                    <h1 className={styles.title}>{newsletter.title}</h1>
                    <p className={styles.description}>{newsletter.description}</p>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>
                            <PeopleCommunity24Regular style={{ fontSize: '16px' }} /> {newsletter._count.subscribers} subscribers
                        </span>
                        <span>•</span>
                        <span>By {newsletter.owner.name}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <Button
                        appearance={newsletter.isSubscribed ? "outline" : "primary"}
                        onClick={toggleSubscribe}
                        className={styles.subscribeButton}
                    >
                        {newsletter.isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </Button>
                    {isOwner && (
                        <Button
                            appearance={activeTab === 'dashboard' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab(activeTab === 'dashboard' ? 'archive' : 'dashboard')}
                        >
                            {activeTab === 'dashboard' ? 'View Profile' : 'Creator Dashboard'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs for Owner */}
            {isOwner && (
                <div className={styles.tabsContainer}>
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`${styles.tab} ${activeTab === 'archive' ? styles.active : ''}`}
                    >
                        Archive
                    </button>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
                    >
                        Dashboard
                    </button>
                </div>
            )}

            {activeTab === 'archive' ? (
                /* Archive / Editions */
                <section>
                    <h2 className={styles.sectionHeader}>
                        <News24Regular /> Archive
                    </h2>

                    {newsletter.editions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Mail24Regular className={styles.emptyIcon} />
                            <h2>No editions published yet</h2>
                            <p>Stay tuned for upcoming content from {newsletter.title}</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {newsletter.editions.map((edition: any) => (
                                <Link
                                    href={`/post/${edition.id}`}
                                    key={edition.id}
                                    className={styles.editionCard}
                                >
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.editionTitle}>{edition.title}</h3>
                                        <span className={styles.date}>
                                            <Calendar24Regular style={{ fontSize: '14px' }} />
                                            {new Date(edition.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={styles.excerpt}>
                                        {edition.content}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            ) : (
                /* Creator Dashboard */
                <section>
                    <div className={styles.dashboardGrid}>
                        <div className={styles.statCard}>
                            <PeopleCommunity24Regular style={{ fontSize: '32px', color: '#0a66c2', marginBottom: '8px' }} />
                            <div className={styles.statValue}>{newsletter._count.subscribers}</div>
                            <div className={styles.statLabel}>Total Subscribers</div>
                        </div>
                        <div className={styles.statCard}>
                            <News24Regular style={{ fontSize: '32px', color: '#0cb4ce', marginBottom: '8px' }} />
                            <div className={styles.statValue}>{newsletter.editions.length}</div>
                            <div className={styles.statLabel}>Editions Published</div>
                        </div>
                        <div className={styles.statCard}>
                            <ChartPerson24Regular style={{ fontSize: '32px', color: '#688911', marginBottom: '8px' }} />
                            <div className={styles.statValue}>{newsletter.analytics?.totalViews || 0}</div>
                            <div className={styles.statLabel}>Total Views</div>
                        </div>
                    </div>

                    <h2 className={styles.sectionHeader}>Subscriber List</h2>
                    <div className={styles.subscriberList}>
                        {newsletter.subscribers?.map((sub: any) => (
                            <div key={sub.id} className={styles.subscriberItem}>
                                <Avatar name={sub.user.name} size="medium" />
                                <div>
                                    <div className={styles.subscriberName}>{sub.user.name}</div>
                                    <div className={styles.subscriberMeta}>{sub.user.role} • Joined {new Date(sub.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                        {(!newsletter.subscribers || newsletter.subscribers.length === 0) && (
                            <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No subscribers found yet.</div>
                        )}
                    </div>
                </section>
            )}
        </div>
    )
}
