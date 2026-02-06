'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
    Eye24Regular,
    PeopleCommunity24Regular,
    News24Regular,
    ChartMultiple24Regular,
    ArrowTrending24Regular
} from '@fluentui/react-icons'
import styles from './analytics.module.css'
import Link from 'next/link'

export default function AnalyticsPage() {
    const { data: session, status } = useSession()
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchAnalytics = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/analytics')
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login')
        }
        if (status === 'authenticated') {
            fetchAnalytics()
        }
    }, [status])

    if (isLoading) return <div className={styles.loading}>Loading Analytics...</div>
    if (!stats) return <div className={styles.loading}>Failed to load analytics</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Analytics Dashboard</h1>
                <p className={styles.subtitle}>Track your content performance and profile reach across ChainVerse.</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <Eye24Regular style={{ color: '#0a66c2' }} />
                        Total Post Views
                    </div>
                    <div className={styles.cardValue}>{stats.totalPostViews.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#8b949e' }}>Across {stats.postCount} published posts</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <ChartMultiple24Regular style={{ color: '#54a3ff' }} />
                        Profile Impressions
                    </div>
                    <div className={styles.cardValue}>{stats.profileViews.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#8b949e' }}>Total profile visits</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <PeopleCommunity24Regular style={{ color: '#107c10' }} />
                        Newsletter Subs
                    </div>
                    <div className={styles.cardValue}>{stats.totalSubscribers.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#8b949e' }}>Across {stats.newsletterCount} newsletters</div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <ArrowTrending24Regular style={{ color: '#71b7fb' }} />
                    Top Performing Content
                </h2>

                {stats.topPosts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e' }}>
                        You haven't published any posts yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {stats.topPosts.map((post: any) => (
                            <div key={post.id} className={styles.postItem}>
                                <div className={styles.postInfo}>
                                    <Link href={`/post/${post.id}`} className={styles.postTitle}>
                                        {post.title}
                                    </Link>
                                    <div className={styles.postMeta}>
                                        {post.postType.replace('_', ' ')} • Created {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className={styles.postViews}>
                                    <span className={styles.viewText}>{post.viewCount}</span>
                                    <span className={styles.viewLabel}>Views</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
