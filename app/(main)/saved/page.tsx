'use client'

import React, { useState, useEffect } from 'react'
import {
    Bookmark24Filled,
    MoreHorizontal24Regular,
    Video24Regular,
    Document24Regular,
    Image24Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import styles from './saved.module.css'

interface SavedPost {
    id: string
    postType: string
    title: string
    content: string
    savedAt: string
    author?: {
        id: string
        name: string
        bio: string | null
        email: string
    }
    company?: {
        id: string
        name: string
    }
    _count: {
        comments: number
        reactions: number
    }
}

export default function SavedPage() {
    const [activeFilter, setActiveFilter] = useState<'All' | 'Articles'>('All')
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    useEffect(() => {
        fetchSavedPosts()
    }, [])

    const fetchSavedPosts = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/saved')
            if (res.ok) {
                const data = await res.json()
                setSavedPosts(data.savedPosts || [])
            } else {
                console.error('Failed to fetch saved posts')
            }
        } catch (error) {
            console.error('Error fetching saved posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnsave = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/save`, {
                method: 'POST'
            })

            if (res.ok) {
                // Remove from local state
                setSavedPosts(prev => prev.filter(post => post.id !== postId))
                setOpenMenuId(null)
            }
        } catch (error) {
            console.error('Error unsaving post:', error)
        }
    }


    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)
        const diffWeeks = Math.floor(diffDays / 7)
        const diffMonths = Math.floor(diffDays / 30)

        if (diffMins < 60) return `${diffMins}min`
        if (diffHours < 24) return `${diffHours}hr`
        if (diffDays < 7) return `${diffDays}d`
        if (diffWeeks < 4) return `${diffWeeks}w`
        return `${diffMonths}mo`
    }

    const getAuthorInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // Filter posts - for now, treat all as posts since we don't have article type in schema
    const filteredPosts = savedPosts

    return (
        <div className={styles.container}>
            {/* Left Sidebar - My Items */}
            <div className={styles.sidebar}>
                <div className={styles.card}>
                    <div className={styles.sidebarHeader}>My items</div>
                    <div className={styles.sidebarMenu}>
                        <Link href="/jobs" className={styles.sidebarItem}>
                            <span>My jobs</span>
                            <span className={styles.count}>0</span>
                        </Link>
                        <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
                            <span>Saved posts and articles</span>
                            <span className={styles.count}>{savedPosts.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>Saved Posts</h1>
                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterButton} ${activeFilter === 'All' ? styles.filterActive : ''}`}
                            onClick={() => setActiveFilter('All')}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.filterButton} ${activeFilter === 'Articles' ? styles.filterActive : ''}`}
                            onClick={() => setActiveFilter('Articles')}
                        >
                            Articles
                        </button>
                    </div>
                </div>

                <div className={styles.feed}>
                    {loading ? (
                        <div className={styles.emptyState}>
                            <p>Loading saved posts...</p>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No saved posts yet. Save posts from your feed to see them here.</p>
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <div key={post.id} className={styles.postItem}>
                                <div className={styles.postHeader}>
                                    <div className={styles.authorInfo}>
                                        <div className={styles.avatar}>
                                            <div style={{
                                                width: '100%', height: '100%',
                                                backgroundColor: 'var(--color-bg-tertiary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: '600'
                                            }}>
                                                {post.author ? getAuthorInitials(post.author.name) : post.company ? post.company.name[0] : '?'}
                                            </div>
                                        </div>
                                        <div className={styles.meta}>
                                            <Link href={`/profile/${post.author?.id || post.company?.id}`} className={styles.name}>
                                                {post.author?.name || post.company?.name || 'Unknown'}
                                            </Link>
                                            <span className={styles.subtext}>{post.author?.bio || post.company?.name || ''}</span>
                                            <span className={styles.subtext}>
                                                {getTimeAgo(post.savedAt)} • <Bookmark24Filled style={{ width: 12, height: 12, display: 'inline-block' }} /> Saved
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className={styles.menuButton}
                                            onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                                        >
                                            <MoreHorizontal24Regular />
                                        </button>
                                        {openMenuId === post.id && (
                                            <div className={styles.dropdown}>
                                                <button
                                                    className={styles.dropdownItem}
                                                    onClick={() => handleUnsave(post.id)}
                                                >
                                                    Unsave
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.postContent}>
                                    <strong>{post.title}</strong>
                                    <br />
                                    {post.content}
                                </div>

                                <div className={styles.postStats}>
                                    <span>{post._count.reactions} reactions</span>
                                    <span>{post._count.comments} comments</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Sidebar - Promo */}
            <div className={styles.sidebar}>
                <div className={`${styles.card} ${styles.promo}`}>
                    <div className={styles.promoContainer}>
                        <div className={styles.promoText}>
                            See who's hiring on ChainVerse.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
