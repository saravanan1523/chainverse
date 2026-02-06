'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Add24Regular, Checkmark24Regular } from '@fluentui/react-icons'
import styles from './CompanyFollowButton.module.css'

interface CompanyFollowButtonProps {
    companyId: string
    initialIsFollowing?: boolean
    onToggle?: (newState: boolean) => void
    className?: string
}

export function CompanyFollowButton({
    companyId,
    initialIsFollowing = false,
    onToggle,
    className
}: CompanyFollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isLoading, setIsLoading] = useState(false)

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a link
        e.stopPropagation()

        setIsLoading(true)
        try {
            const res = await fetch(`/api/companies/${companyId}/follow`, {
                method: 'POST'
            })

            if (res.ok) {
                const data = await res.json()
                const newState = data.following
                setIsFollowing(newState)
                if (onToggle) onToggle(newState)
            }
        } catch (error) {
            console.error('Failed to toggle follow status', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            appearance={isFollowing ? 'outline' : 'primary'}
            icon={isFollowing ? <Checkmark24Regular /> : <Add24Regular />}
            onClick={handleFollowToggle}
            className={`${styles.button} ${isFollowing ? styles.following : ''} ${className || ''}`}
            disabled={isLoading}
        >
            {isLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
        </Button>
    )
}
