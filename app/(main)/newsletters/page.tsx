'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Mail24Regular, PeopleCommunity24Regular, News24Regular, Add24Regular } from '@fluentui/react-icons'
import styles from '../saved/saved.module.css'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { NewsletterCreateModal } from '@/components/posts/NewsletterCreateModal'

export default function NewslettersPage() {
    const { data: session, status } = useSession()
    const [mySubscriptions, setMySubscriptions] = useState<any[]>([])
    const [allNewsletters, setAllNewsletters] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Fetch my subscriptions
            const subRes = await fetch('/api/newsletters/subscribed')
            if (subRes.ok) {
                const subData = await subRes.json()
                setMySubscriptions(subData)
            }

            // Fetch all for discovery
            const allRes = await fetch('/api/newsletters')
            if (allRes.ok) {
                const allData = await allRes.json()
                setAllNewsletters(allData)
            }
        } catch (error) {
            console.error('Failed to fetch newsletters:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login')
        }
        if (status === 'authenticated') {
            fetchData()
        }
    }, [status])

    const toggleSubscribe = async (newsletterId: string) => {
        try {
            const res = await fetch(`/api/newsletters/${newsletterId}/subscribe`, {
                method: 'POST'
            })
            if (res.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Failed to toggle subscription:', error)
        }
    }

    if (status === 'loading' || isLoading) {
        return <div className={styles.loading}>Loading Newsletters...</div>
    }

    const subscribedIds = new Set(mySubscriptions.map(s => s.id))

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail24Regular className={styles.icon} style={{ fontSize: '32px', color: '#0a66c2' }} />
                    <h1 className={styles.title}>Newsletters</h1>
                </div>
                <Button
                    appearance="outline"
                    icon={<Add24Regular />}
                    onClick={() => setIsModalOpen(true)}
                    style={{ borderRadius: '24px', padding: '6px 20px', color: '#71b7fb', borderColor: '#71b7fb' }}
                >
                    Create newsletter
                </Button>
            </div>

            <NewsletterCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={fetchData}
            />

            {/* My Subscriptions */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#fff' }}>My Subscriptions</h2>
                {mySubscriptions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Mail24Regular className={styles.emptyIcon} />
                        <h2>No subscriptions yet</h2>
                        <p>Discover newsletters to stay updated with industry news</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {mySubscriptions.map(nl => (
                            <NewsletterCard
                                key={nl.id}
                                newsletter={nl}
                                isSubscribed={true}
                                onToggle={() => toggleSubscribe(nl.id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Discovery */}
            <section>
                <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#fff' }}>Discover</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {allNewsletters
                        .filter(nl => !subscribedIds.has(nl.id))
                        .map(nl => (
                            <NewsletterCard
                                key={nl.id}
                                newsletter={nl}
                                isSubscribed={false}
                                onToggle={() => toggleSubscribe(nl.id)}
                            />
                        ))
                    }
                </div>
            </section>
        </div>
    )
}

function NewsletterCard({ newsletter, isSubscribed, onToggle }: { newsletter: any, isSubscribed: boolean, onToggle: () => void }) {
    return (
        <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Avatar name={newsletter.title} size="large" />
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{newsletter.title}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#8b949e' }}>
                        By {newsletter.owner.name} • {newsletter._count.subscribers} subscribers
                    </p>
                </div>
            </div>
            <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#aeaeae',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>
                {newsletter.description}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                <Button
                    appearance={isSubscribed ? "outline" : "primary"}
                    style={{ width: '100%' }}
                    onClick={onToggle}
                >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
            </div>
        </div>
    )
}
