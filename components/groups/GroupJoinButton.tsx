'use client'

import { useState, useEffect } from 'react'
import { Button } from '@fluentui/react-components'
import { useSession } from 'next-auth/react'

interface GroupJoinButtonProps {
    groupId: string
    onStatusChange?: (isMember: boolean) => void
}

export function GroupJoinButton({ groupId, onStatusChange }: GroupJoinButtonProps) {
    const { data: session } = useSession()
    const [isMember, setIsMember] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkStatus = async () => {
            if (!session) {
                setIsLoading(false)
                return
            }
            try {
                const res = await fetch(`/api/groups/${groupId}/membership`)
                if (res.ok) {
                    const data = await res.json()
                    setIsMember(data.isMember)
                    onStatusChange?.(data.isMember)
                }
            } catch (error) {
                console.error('Failed to check group membership:', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkStatus()
    }, [groupId, session, onStatusChange])

    const handleJoin = async () => {
        if (!session) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/groups/${groupId}/membership`, { method: 'POST' })
            if (res.ok) {
                setIsMember(true)
                onStatusChange?.(true)
            }
        } catch (error) {
            console.error('Failed to join group:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLeave = async () => {
        if (!session) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/groups/${groupId}/membership`, { method: 'DELETE' })
            if (res.ok) {
                setIsMember(false)
                onStatusChange?.(false)
            }
        } catch (error) {
            console.error('Failed to leave group:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!session) return null

    return (
        <Button
            appearance={isMember ? 'outline' : 'primary'}
            disabled={isLoading}
            onClick={isMember ? handleLeave : handleJoin}
        >
            {isLoading ? '...' : isMember ? 'Leave Group' : 'Join Group'}
        </Button>
    )
}
