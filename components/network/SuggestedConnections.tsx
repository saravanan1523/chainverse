'use client'

import { useState, useEffect } from 'react'
import { PersonAdd24Regular } from '@fluentui/react-icons'
import { Avatar } from '../ui/Avatar'
import { Button } from '@fluentui/react-components'
import styles from './suggestedConnections.module.css'

interface UserSuggestion {
    id: string
    name: string
    role: string
    industry: string
}

export function SuggestedConnections() {
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await fetch('/api/recommendations/users')
                if (res.ok) {
                    const data = await res.json()
                    setSuggestions(data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSuggestions()
    }, [])

    const handleConnect = async (userId: string) => {
        // Optimistic UI removal
        setSuggestions(prev => prev.filter(u => u.id !== userId))
        try {
            await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: userId })
            })
        } catch (error) {
            console.error('Failed to connect')
        }
    }

    if (isLoading || suggestions.length === 0) return null

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>People you may know</h3>
            </div>

            <div className={styles.list}>
                {suggestions.map(user => (
                    <div key={user.id} className={styles.item}>
                        <Avatar name={user.name} size="medium" />
                        <div className={styles.info}>
                            <div className={styles.name}>{user.name}</div>
                            <div className={styles.context}>
                                {user.role || user.industry || 'Supply Chain Pro'}
                            </div>
                            <button
                                className={styles.connectBtn}
                                onClick={() => handleConnect(user.id)}
                            >
                                <PersonAdd24Regular />
                                Connect
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
