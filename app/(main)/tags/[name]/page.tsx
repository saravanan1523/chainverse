'use client'

import { use, useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PostCard } from '@/components/posts/PostCard'
import { TagChip } from '@/components/tags/TagChip'
import { CheckmarkCircle20Filled, Add24Regular } from '@fluentui/react-icons'
import styles from './tagPage.module.css'

interface Tag {
    id: string
    name: string
    displayName: string
    description?: string
    postCount: number
    followerCount: number
}

export default function TagPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = use(params)
    const [tag, setTag] = useState<Tag | null>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchTag()
        fetchPosts()
    }, [name])

    const fetchTag = async () => {
        try {
            const res = await fetch(`/api/tags/${name}`)
            if (res.ok) {
                const data = await res.json()
                setTag(data)
            }
        } catch (error) {
            console.error('Failed to fetch tag:', error)
        }
    }

    const fetchPosts = async () => {
        try {
            const res = await fetch(`/api/tags/${name}/posts`)
            if (res.ok) {
                const data = await res.json()
                setPosts(data)
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFollow = async () => {
        try {
            const res = await fetch(`/api/tags/${name}/follow`, { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                setIsFollowing(data.following)
                // Refresh tag data to update follower count
                fetchTag()
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error)
        }
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>
    }

    if (!tag) {
        return (
            <div className={styles.notFound}>
                <h1>Tag not found</h1>
                <p>The tag #{name} doesn't exist yet.</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <Card className={styles.header}>
                <div className={styles.tagInfo}>
                    <h1 className={styles.tagName}>
                        <span className={styles.hash}>#</span>
                        {tag.displayName}
                    </h1>
                    {tag.description && (
                        <p className={styles.description}>{tag.description}</p>
                    )}
                    <div className={styles.stats}>
                        <span>{tag.postCount} posts</span>
                        <span>·</span>
                        <span>{tag.followerCount} followers</span>
                    </div>
                </div>

                <Button
                    appearance={isFollowing ? "subtle" : "primary"}
                    icon={isFollowing ? <CheckmarkCircle20Filled /> : <Add24Regular />}
                    onClick={handleFollow}
                >
                    {isFollowing ? 'Following' : 'Follow Tag'}
                </Button>
            </Card>

            <div className={styles.posts}>
                <h2 className={styles.postsTitle}>Recent Posts</h2>
                {posts.length === 0 ? (
                    <Card className={styles.empty}>
                        <p>No posts with this tag yet.</p>
                    </Card>
                ) : (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                )}
            </div>
        </div>
    )
}
