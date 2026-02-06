'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { TagChip } from './TagChip'
import { Sparkle24Regular } from '@fluentui/react-icons'
import styles from './trendingTags.module.css'

interface Tag {
    id: string
    name: string
    displayName: string
    postCount: number
    followerCount: number
}

export function TrendingTags() {
    const [tags, setTags] = useState<Tag[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchTrending()
    }, [])

    const fetchTrending = async () => {
        try {
            const res = await fetch('/api/tags/trending?limit=8')
            if (res.ok) {
                const data = await res.json()
                setTags(data)
            }
        } catch (error) {
            console.error('Failed to fetch trending tags:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <Card className={styles.container}>
                <div className={styles.header}>
                    <Sparkle24Regular className={styles.icon} />
                    <h3 className={styles.title}>Trending Topics</h3>
                </div>
                <p className={styles.loading}>Loading...</p>
            </Card>
        )
    }

    if (tags.length === 0) {
        return null
    }

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <Sparkle24Regular className={styles.icon} />
                <h3 className={styles.title}>Trending Topics</h3>
            </div>

            <div className={styles.tagsList}>
                {tags.map((tag, index) => (
                    <div key={tag.id} className={styles.tagItem}>
                        <span className={styles.rank}>{index + 1}</span>
                        <TagChip
                            name={tag.name}
                            postCount={tag.postCount}
                        />
                    </div>
                ))}
            </div>
        </Card>
    )
}
