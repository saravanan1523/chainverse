'use client'

import { useState, useEffect } from 'react'
import { ConnectionCard } from '@/components/network/ConnectionCard'
import styles from './network.module.css'

export default function MyNetworkPage() {
    const [invitations, setInvitations] = useState<any[]>([])
    const [connections, setConnections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchNetwork = async () => {
        setIsLoading(true)
        try {
            // Fetch pending invitations (where I am receiver)
            const pendingRes = await fetch('/api/connections?type=pending')
            const pendingData = await pendingRes.json()
            if (Array.isArray(pendingData)) setInvitations(pendingData)

            // Fetch accepted connections
            const acceptedRes = await fetch('/api/connections?type=accepted')
            const acceptedData = await acceptedRes.json()
            if (Array.isArray(acceptedData)) setConnections(acceptedData)
        } catch (error) {
            console.error('Failed to fetch network:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNetwork()
    }, [])

    if (isLoading) {
        return <div className={styles.loading}>Loading network...</div>
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>My Network</h1>

            {invitations.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionHeader}>
                        Invitations ({invitations.length})
                    </h2>
                    <div className={styles.grid}>
                        {invitations.map(invite => (
                            <ConnectionCard
                                key={invite.id}
                                connectionId={invite.id}
                                user={invite.user}
                                status={invite.status}
                                isRequester={invite.isRequester}
                                onUpdate={fetchNetwork}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className={styles.sectionHeader}>
                    Connections ({connections.length})
                </h2>
                {connections.length === 0 ? (
                    <div className={styles.emptyState}>
                        You don't have any connections yet. Search for people to connect with!
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {connections.map(conn => (
                            <ConnectionCard
                                key={conn.id}
                                connectionId={conn.id}
                                user={conn.user}
                                status={conn.status}
                                isRequester={conn.isRequester}
                                onUpdate={fetchNetwork}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
