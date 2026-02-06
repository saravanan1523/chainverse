'use client'

import { useEffect, useState } from 'react'
import { GroupJoinButton } from '@/components/groups/GroupJoinButton'
import { CreatePostCard } from '@/components/posts/CreatePostCard'
import { PostFeed } from '@/components/feed/PostFeed'
import { Building24Regular, Location24Regular, People24Regular, Poll24Regular, Add24Regular } from '@fluentui/react-icons'
import { PollCard } from '@/components/groups/PollCard'
import { CreatePollModal } from '@/components/groups/CreatePollModal'
import { Button } from '@fluentui/react-components'
import styles from './groupDetail.module.css'

interface GroupDetailClientProps {
    id: string
}

export default function GroupDetailClient({ id }: GroupDetailClientProps) {
    const [group, setGroup] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isMember, setIsMember] = useState(false)
    const [polls, setPolls] = useState<any[]>([])
    const [isPollModalOpen, setIsPollModalOpen] = useState(false)

    const fetchPolls = async () => {
        try {
            const res = await fetch(`/api/polls?groupId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setPolls(data)
            }
        } catch (error) {
            console.error('Failed to fetch polls:', error)
        }
    }

    const handleVote = async (pollId: string, optionId: string) => {
        try {
            const res = await fetch(`/api/polls/${pollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId })
            })
            if (res.ok) {
                // Refresh polls to get updated counts and user votes
                fetchPolls()
            }
        } catch (error) {
            console.error('Failed to vote:', error)
        }
    }

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await fetch(`/api/groups/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setGroup(data)
                }
            } catch (error) {
                console.error('Failed to fetch group:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchGroup()
            fetchPolls()
        }
    }, [id])

    if (isLoading) return <div className={styles.centeredState}>Loading...</div>
    if (!group) return <div className={styles.centeredState}>Group not found</div>

    return (
        <div className={styles.container}>
            <main>
                <div className={styles.headerCard}>
                    <div className={styles.banner}></div>
                    <div className={styles.headerContent}>
                        <div className={styles.logoContainer}>
                            {group.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div className={styles.headerInfoRow}>
                            <div>
                                <h1 className={styles.title}>{group.name}</h1>
                                <p className={styles.metaText}>
                                    Listed group · {group._count?.members || 0} members
                                </p>
                            </div>
                            <GroupJoinButton groupId={id} onStatusChange={setIsMember} />
                        </div>

                        <div className={styles.aboutSection}>
                            <h2 className={styles.sectionTitle}>About this group</h2>
                            <p className={styles.aboutDescription}>{group.description}</p>
                        </div>
                    </div>
                </div>

                {isMember && (
                    <>
                        <CreatePostCard groupId={id} />
                        <div style={{ marginTop: 'var(--space-lg)' }}>
                            <PostFeed groupId={id} />
                        </div>
                    </>
                )}

                {!isMember && (
                    <div className={styles.noAccess}>
                        <h3 className={styles.noAccessTitle}>Join this group to see the feed</h3>
                        <p className={styles.noAccessDesc}>Connect with other professionals in {group.name}</p>
                    </div>
                )}
            </main>

            <aside>
                {isMember && (
                    <div className={styles.sidebarWidget}>
                        <div className={styles.widgetHeader}>
                            <h3 className={styles.widgetTitle}>Polls</h3>
                            <Button
                                appearance="subtle"
                                size="small"
                                icon={<Add24Regular />}
                                onClick={() => setIsPollModalOpen(true)}
                            >
                                New Poll
                            </Button>
                        </div>
                        {polls.length === 0 ? (
                            <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>No active polls</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {polls.slice(0, 3).map(poll => (
                                    <PollCard
                                        key={poll.id}
                                        poll={poll}
                                        onVote={(optionId) => handleVote(poll.id, optionId)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.sidebarWidget}>
                    <h3 className={styles.widgetTitle} style={{ marginBottom: 'var(--space-md)' }}>Group Information</h3>

                    {group.industry && (
                        <div className={styles.infoItem}>
                            <Building24Regular />
                            <span>{group.industry}</span>
                        </div>
                    )}

                    {group.location && (
                        <div className={styles.infoItem}>
                            <Location24Regular />
                            <span>{group.location}</span>
                        </div>
                    )}
                </div>

                {group.rules && (
                    <div className={styles.sidebarWidget}>
                        <h3 className={styles.widgetTitle} style={{ marginBottom: 'var(--space-sm)' }}>Rules</h3>
                        <p className={styles.rulesText}>{group.rules}</p>
                    </div>
                )}
            </aside>

            <CreatePollModal
                isOpen={isPollModalOpen}
                onClose={() => setIsPollModalOpen(false)}
                groupId={id}
                onPollCreated={fetchPolls}
            />
        </div>
    )
}
