'use client'

import styles from './tagChip.module.css'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckmarkCircle20Regular, Add20Regular } from '@fluentui/react-icons'
import { useState } from 'react'

interface TagChipProps {
    name: string
    postCount?: number
    isFollowing?: boolean
    showFollowButton?: boolean
    onFollow?: () => void
}

export function TagChip({ name, postCount, isFollowing, showFollowButton, onFollow }: TagChipProps) {
    const [following, setFollowing] = useState(isFollowing || false)
    const [loading, setLoading] = useState(false)

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setLoading(true)
        try {
            const res = await fetch(`/api/tags/${name}/follow`, { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                setFollowing(data.following)
                onFollow?.()
            }
        } catch (error) {
            console.error('Failed to follow tag:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <Link href={`/tags/${name}`} className={styles.link}>
                <span className={styles.hash}>#</span>
                <span className={styles.name}>{name}</span>
                {postCount !== undefined && (
                    <span className={styles.count}>{postCount} posts</span>
                )}
            </Link>

            {showFollowButton && (
                <Button
                    size="small"
                    appearance={following ? "subtle" : "primary"}
                    icon={following ? <CheckmarkCircle20Regular /> : <Add20Regular />}
                    onClick={handleFollow}
                    disabled={loading}
                    className={styles.followBtn}
                >
                    {following ? 'Following' : 'Follow'}
                </Button>
            )}
        </div>
    )
}
