'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Add24Regular } from '@fluentui/react-icons'
import { NewMessageModal } from './NewMessageModal'
import styles from './messaging.module.css'

interface Conversation {
    id: string
    lastMessageAt: string
    otherUser: {
        id: string
        name: string
        isPremium: boolean
    }
    lastMessage?: {
        content: string
        createdAt: string
    }
    unreadCount: number
}

interface ConversationListProps {
    onSelect: (id: string) => void
    selectedId?: string
}

export function ConversationList({ onSelect, selectedId }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchConversations()
    }, [])

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/conversations')
            if (res.ok) {
                const data = await res.json()
                setConversations(data)
            }
        } catch (error) {
            console.error('Failed to load conversations', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateConversation = async (userId: string) => {
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: userId }),
            })

            if (res.ok) {
                const newConv = await res.json()
                // Check if already exists in list to avoid duplicate
                const exists = conversations.find(c => c.id === newConv.id)
                if (!exists) {
                    setConversations(prev => [newConv, ...prev])
                }
                onSelect(newConv.id)
            }
        } catch (error) {
            console.error('Failed to create conversation', error)
        }
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading conversations...</div>
    }

    return (
        <div className={styles.listContainer}>
            <div className={styles.listHeader}>
                <h3 className={styles.listTitle}>Messaging</h3>
                <Button
                    icon={<Add24Regular />}
                    appearance="subtle"
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            <div className={styles.listContent}>
                {conversations.length === 0 ? (
                    <p className={styles.empty}>No conversations yet.</p>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`${styles.convItem} ${selectedId === conv.id ? styles.selected : ''}`}
                            onClick={() => onSelect(conv.id)}
                        >
                            <Avatar name={conv.otherUser.name} size={48} />
                            <div className={styles.convInfo}>
                                <div className={styles.convRow}>
                                    <span className={styles.convName}>{conv.otherUser.name}</span>
                                    {conv.lastMessage && (
                                        <span className={styles.convTime}>
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.convRow}>
                                    <p className={styles.convPreview}>
                                        {conv.lastMessage?.content || 'No messages'}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <NewMessageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectUser={handleCreateConversation}
            />
        </div>
    )
}
