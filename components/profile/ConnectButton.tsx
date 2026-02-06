'use client'

import { useState, useEffect } from 'react'
import { Button } from '@fluentui/react-components'
import { PersonAdd24Regular, Checkmark24Regular, Clock24Regular } from '@fluentui/react-icons'

interface ConnectButtonProps {
    userId: string
    initialStatus?: 'NONE' | 'PENDING' | 'ACCEPTED'
}

export function ConnectButton({ userId, initialStatus = 'NONE' }: ConnectButtonProps) {
    const [status, setStatus] = useState(initialStatus)
    const [isLoading, setIsLoading] = useState(false)

    // Check status on mount if not provided or NONE (could be optimized)
    useEffect(() => {
        const checkStatus = async () => {
            if (userId && status === 'NONE') {
                try {
                    // This is a bit inefficient to fetch all connections, 
                    // but we don't have a single connection check API yet without ID.
                    // For now, let's assume the parent might pass it or we fetch list.
                    // A better approach: GET /api/connections?userId={id}
                    // Since we implemented GET /api/connections returning list, we can filter client side or add param.

                    // Let's implement a specific check if needed, but for now relies on props or simple toggle.
                } catch (e) {
                    console.error(e)
                }
            }
        }
        // checkStatus()
    }, [userId, status])

    const handleConnect = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: userId })
            })

            if (res.ok) {
                setStatus('PENDING')
            } else {
                // If 409, might be already connected or pending
                const data = await res.json()
                if (data.error === 'Request already pending') setStatus('PENDING')
                if (data.error === 'Already connected') setStatus('ACCEPTED')
            }
        } catch (error) {
            console.error('Failed to connect:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'ACCEPTED') {
        return (
            <Button icon={<Checkmark24Regular />} appearance="outline" disabled>
                Connected
            </Button>
        )
    }

    if (status === 'PENDING') {
        return (
            <Button icon={<Clock24Regular />} appearance="subtle" disabled>
                Pending
            </Button>
        )
    }

    return (
        <Button
            icon={<PersonAdd24Regular />}
            appearance="primary"
            onClick={handleConnect}
            disabled={isLoading}
        >
            Connect
        </Button>
    )
}
