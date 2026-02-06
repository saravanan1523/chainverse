'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { UserProfileCard } from '@/components/profile/UserProfileCard'
import { QuickLinks } from '@/components/profile/QuickLinks'
import { CreatePostCard } from '@/components/posts/CreatePostCard'
import { FeedTabs } from '@/components/feed/FeedTabs'
import { PostCard } from '@/components/posts/PostCard'
import { TrendingSection } from '@/components/trending/TrendingSection'
import styles from './page.module.css'

type FeedType = 'ops' | 'people' | 'company'

export default function HomePage() {
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState<FeedType>('ops')
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
        redirect('/login')
    }

    // Fetch posts based on active tab
    useEffect(() => {
        if (status === 'authenticated') {
            fetchPosts(activeTab)
        }
    }, [activeTab, status])

    const fetchPosts = async (feedType: FeedType) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/posts?feedType=${feedType}`)
            const data = await response.json()

            if (Array.isArray(data)) {
                setPosts(data)
            } else {
                console.error('API Error: Received non-array response', data)
                setPosts([])
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async (postId: string) => {
        try {
            await fetch(`/api/posts/${postId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'LIKE' }),
            })
            fetchPosts(activeTab)
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
            fetchPosts(activeTab)
        } catch (error) {
            console.error('Error saving post:', error)
        }
    }

    if (status === 'loading') {
        return <div className={styles.loading}>Loading...</div>
    }

    return (
        <div className={styles.homeContainer}>
            {/* Center Feed */}
            <main className={styles.centerFeed}>
                <CreatePostCard />
                <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className={styles.posts}>
                    {loading ? (
                        <div className={styles.loadingPosts}>Loading posts...</div>
                    ) : posts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h3>No posts yet</h3>
                            <p>Be the first to share something with the community!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={() => handleLike(post.id)}
                                onSave={() => handleSave(post.id)}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
