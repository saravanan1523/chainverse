'use client'

import { useState } from 'react'
import { Button } from '@fluentui/react-components'
import { PersonAdd24Regular, Dismiss24Regular, Checkmark24Regular } from '@fluentui/react-icons'
import styles from './connectionCard.module.css'

interface ConnectionUser {
    id: string
    name: string
    role: string | null
    industry: string | null
    image: string | null
}

interface ConnectionCardProps {
    connectionId: string
    user: ConnectionUser
    status: 'PENDING' | 'ACCEPTED'
    isRequester: boolean
    onUpdate: () => void
}

export function ConnectionCard({ connectionId, user, status, isRequester, onUpdate }: ConnectionCardProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleAccept = async () => {
        setIsLoading(true)
        try {
            await fetch(`/api/connections/${connectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACCEPTED' })
            })
            onUpdate()
        } catch (error) {
            console.error('Failed to accept:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        setIsLoading(true)
        try {
            await fetch(`/api/connections/${connectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' })
            })
            onUpdate()
        } catch (error) {
            console.error('Failed to reject:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemove = async () => {
        if (!confirm('Are you sure you want to remove this connection?')) return
        setIsLoading(true)
        try {
            await fetch(`/api/connections/${connectionId}`, {
                method: 'DELETE'
            })
            onUpdate()
        } catch (error) {
            console.error('Failed to remove:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
                <h3 className={styles.name}>{user.name}</h3>
                <p className={styles.role}>{user.role || 'Supply Chain Professional'}</p>
                {user.industry && <p className={styles.meta}>{user.industry}</p>}

                <div className={styles.actions}>
                    {status === 'PENDING' && !isRequester && (
                        <>
                            <Button
                                icon={<Checkmark24Regular />}
                                onClick={handleAccept}
                                disabled={isLoading}
                                appearance="primary"
                            >
                                Accept
                            </Button>
                            <Button
                                icon={<Dismiss24Regular />}
                                onClick={handleReject}
                                disabled={isLoading}
                            >
                                Ignore
                            </Button>
                        </>
                    )}
                    {status === 'PENDING' && isRequester && (
                        <Button disabled appearance="subtle">
                            Request Sent
                        </Button>
                    )}
                    {status === 'ACCEPTED' && (
                        <Button
                            icon={<Dismiss24Regular />}
                            onClick={handleRemove}
                            disabled={isLoading}
                            appearance="subtle"
                        >
                            Remove
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
