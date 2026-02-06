'use client'

import { useState, useEffect } from 'react'
import { Dismiss24Regular, Search24Regular, Checkmark24Regular, Copy24Regular, Share24Regular } from '@fluentui/react-icons'
import styles from './SharePostModal.module.css'
import { Avatar } from '../ui/Avatar'

interface SharePostModalProps {
    postId: string
    isOpen: boolean
    onClose: () => void
}

interface Connection {
    id: string
    user: {
        id: string
        name: string
        role: string | null
        industry: string | null
        image?: string
    }
}

export function SharePostModal({ postId, isOpen, onClose }: SharePostModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [connections, setConnections] = useState<Connection[]>([])
    const [filteredConnections, setFilteredConnections] = useState<Connection[]>([])
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [sentMap, setSentMap] = useState<Record<string, boolean>>({})

    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : `/post/${postId}`

    // Fetch connections when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchConnections()
        }
    }, [isOpen])

    // Filter connections when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredConnections(connections)
        } else {
            const lowerQuery = searchQuery.toLowerCase()
            const filtered = connections.filter(conn =>
                conn.user.name.toLowerCase().includes(lowerQuery) ||
                conn.user.role?.toLowerCase().includes(lowerQuery)
            )
            setFilteredConnections(filtered)
        }
    }, [searchQuery, connections])

    const fetchConnections = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/connections?type=accepted')
            if (response.ok) {
                const data = await response.json()
                setConnections(data)
                setFilteredConnections(data)
            }
        } catch (error) {
            console.error('Failed to fetch connections', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSend = async (userId: string) => {
        // Mock send functionality for now
        // In a real app, this would call an API to send a message or notification
        setSentMap(prev => ({ ...prev, [userId]: true }))

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
        }}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <h2>Share Post</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <Dismiss24Regular />
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Search & Connections Section */}
                    <div className={styles.section}>
                        <span className={styles.sectionTitle}>Send to connections</span>

                        <div className={styles.searchWrapper}>
                            <Search24Regular className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search by name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className={styles.connectionsList}>
                            {loading ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                    Loading connections...
                                </div>
                            ) : filteredConnections.length > 0 ? (
                                filteredConnections.map(conn => (
                                    <div key={conn.id} className={styles.connectionItem}>
                                        <div className={styles.userInfo}>
                                            <Avatar name={conn.user.name} size="medium" image={conn.user.image} />
                                            <div className={styles.userDetails}>
                                                <span className={styles.userName}>{conn.user.name}</span>
                                                <span className={styles.userHeadline}>
                                                    {conn.user.role || conn.user.industry || 'Member'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.sendButton}
                                            onClick={() => handleSend(conn.user.id)}
                                            disabled={sentMap[conn.user.id]}
                                            style={sentMap[conn.user.id] ? {
                                                borderColor: 'transparent',
                                                color: 'var(--color-success, #107c10)',
                                                cursor: 'default'
                                            } : {}}
                                        >
                                            {sentMap[conn.user.id] ? 'Sent' : 'Send'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                    {searchQuery ? 'No connections found matching your search.' : 'You don\'t have any connections yet.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Copy Link Section */}
                    <div className={styles.section} style={{ marginBottom: 0 }}>
                        <span className={styles.sectionTitle}>Copy link to post</span>
                        <div className={styles.copyLinkWrapper}>
                            <div className={styles.linkInput}>
                                {postUrl}
                            </div>
                            <button
                                className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                                onClick={handleCopyLink}
                            >
                                {copied ? <Checkmark24Regular /> : <Copy24Regular />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
