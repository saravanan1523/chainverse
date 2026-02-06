'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Search24Regular } from '@fluentui/react-icons'
import styles from './newMessageModal.module.css'

interface User {
    id: string
    name: string
    bio?: string
    image?: string
}

interface NewMessageModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectUser: (userId: string) => void
}

export function NewMessageModal({ isOpen, onClose, onSelectUser }: NewMessageModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers(searchQuery)
            } else {
                setUsers([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const searchUsers = async (query: string) => {
        setIsLoading(true)
        try {
            // Ideally we should have a dedicated user search API
            // For now we might need to rely on what's available or create one
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Search failed', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUserSelect = async (user: User) => {
        // useMessaging context might have a helper, or we can just pass ID up
        onSelectUser(user.id)
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Message"
            size="small"
        >
            <div className={styles.container}>
                <div className={styles.searchBox}>
                    <Search24Regular className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search for people..."
                        className={styles.input}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className={styles.results}>
                    {isLoading && <div className={styles.message}>Searching...</div>}

                    {!isLoading && searchQuery && users.length === 0 && (
                        <div className={styles.message}>No people found</div>
                    )}

                    {users.map(user => (
                        <button
                            key={user.id}
                            className={styles.userItem}
                            onClick={() => handleUserSelect(user)}
                        >
                            <Avatar name={user.name} size="medium" />
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user.name}</span>
                                {user.bio && (
                                    <span className={styles.userHeadline}>{user.bio}</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    )
}
