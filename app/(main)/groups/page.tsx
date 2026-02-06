'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal24Regular } from '@fluentui/react-icons'
import Link from 'next/link'
import { CreateGroupModal } from './CreateGroupModal'
import styles from './groups.module.css'

export default function GroupsPage() {
    const [activeTab, setActiveTab] = useState<'your-groups' | 'requested'>('your-groups')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // State for data
    const [myGroups, setMyGroups] = useState<any[]>([])
    const [suggestedGroups, setSuggestedGroups] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups')
            if (res.ok) {
                const data = await res.json()
                setMyGroups(data.myGroups)
                setSuggestedGroups(data.suggestedGroups)
            }
        } catch (error) {
            console.error('Failed to fetch groups', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    const handleJoinGroup = async (groupId: string) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/join`, {
                method: 'POST'
            })
            if (res.ok) {
                fetchGroups()
            }
        } catch (error) {
            console.error('Failed to join group', error)
        }
    }

    return (
        <div className={styles.container}>
            {/* Main Content */}
            <main className={styles.mainCard}>
                <div className={styles.header}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'your-groups' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('your-groups')}
                        >
                            Your groups
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'requested' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('requested')}
                        >
                            Requested
                        </button>
                    </div>
                    <button
                        className={styles.createButton}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create group
                    </button>
                </div>

                <div className={styles.groupList}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading...</div>
                    ) : activeTab === 'your-groups' ? (
                        myGroups.length > 0 ? (
                            myGroups.map(group => (
                                <Link href={`/groups/${group.id}`} key={group.id} className={styles.groupItem} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <div className={styles.groupLogo}>
                                        {group.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className={styles.groupInfo}>
                                        <span className={styles.groupName}>{group.name}</span>
                                        <span className={styles.memberCount}>{group._count?.members || 1} members</span>
                                    </div>
                                    <button className={styles.moreButton} onClick={(e) => {
                                        e.preventDefault();
                                    }}>
                                        <MoreHorizontal24Regular />
                                    </button>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                You haven't joined any groups yet.
                            </div>
                        )
                    ) : (
                        <div className={styles.emptyState}>
                            No pending requests
                        </div>
                    )}
                </div>

                {activeTab === 'your-groups' && (
                    <div className={styles.footerSearch}>
                        <span className={styles.searchLink}>Search</span> other trusted communities that share and support your goals.
                    </div>
                )}
            </main>

            {/* Right Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                    <h2 className={styles.sidebarTitle}>Groups you might be interested in</h2>

                    {suggestedGroups.length > 0 ? (
                        suggestedGroups.map(group => (
                            <div key={group.id} className={styles.suggestionItem}>
                                <div className={styles.suggestionLogo}>
                                    {group.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className={styles.suggestionInfo}>
                                    <span className={styles.suggestionName}>{group.name}</span>
                                    <span className={styles.suggestionMembers}>{group._count?.members || 0} members</span>
                                    <button
                                        className={styles.joinButton}
                                        onClick={() => handleJoinGroup(group.id)}
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No suggestions available.</div>
                    )}
                </div>
            </aside>

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false)
                    fetchGroups()
                }}
            />
        </div>
    )
}
