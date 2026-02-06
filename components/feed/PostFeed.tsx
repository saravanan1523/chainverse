'use client'

import { useState, useEffect, useCallback } from 'react'
import { PostCard } from '@/components/posts/PostCard'
import styles from './postFeed.module.css'

interface PostFeedProps {
    groupId?: string
    authorId?: string
    feedType?: 'ops' | 'people' | 'company'
}

export function PostFeed({ groupId, authorId, feedType }: PostFeedProps) {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (groupId) params.append('groupId', groupId)
            if (authorId) params.append('authorId', authorId)
            if (feedType) params.append('feedType', feedType)

            const response = await fetch(`/api/posts?${params.toString()}`)
            const data = await response.json()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }, [groupId, authorId, feedType])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    const handleLike = async (postId: string) => {
        try {
            await fetch(`/api/posts/${postId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'LIKE' }),
            })
            fetchPosts()
        } catch (error) {
            console.error('Error liking post:', error)
        }
    }

    const handleSave = async (postId: string) => {
        try {
            await fetch(`/api/posts/${postId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'SAVE' }),
            })
            fetchPosts()
        } catch (error) {
            console.error('Error saving post:', error)
        }
    }

    if (loading && posts.length === 0) {
        return <div className={styles.loading}>Loading posts...</div>
    }

    if (posts.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h3>No posts yet</h3>
                <p>Be the first to share something with the community!</p>
            </div>
        )
    }

    return (
        <div className={styles.postsContainer}>
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => handleLike(post.id)}
                    onSave={() => handleSave(post.id)}
                />
            ))}
        </div>
    )
}
