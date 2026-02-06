'use client'

import { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import {
    Heart24Regular,
    Heart24Filled,
    Comment24Regular,
    BookmarkRegular,
    BookmarkFilled,
    Eye24Regular,
    Share24Regular,
} from '@fluentui/react-icons'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { CommentInput } from './CommentInput'
import { CommentList } from './CommentList'
import styles from './PostDetail.module.css'

interface PostDetailProps {
    post: any
    isLiked?: boolean
    isSaved?: boolean
}

export function PostDetail({ post, isLiked: initialIsLiked, isSaved: initialIsSaved }: PostDetailProps) {
    const router = useRouter()
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const [likeCount, setLikeCount] = useState(post._count?.reactions || 0)
    const [comments, setComments] = useState<any[]>([])
    const [commentCount, setCommentCount] = useState(post._count?.comments || 0)
    const [isLoadingComments, setIsLoadingComments] = useState(true)

    const LikeIcon = isLiked ? Heart24Filled : Heart24Regular
    const SaveIcon = isSaved ? BookmarkFilled : BookmarkRegular

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/posts/${post.id}/comments`)
                if (response.ok) {
                    const data = await response.json()
                    setComments(data)
                }
            } catch (error) {
                console.error('Error fetching comments:', error)
            } finally {
                setIsLoadingComments(false)
            }
        }

        fetchComments()
    }, [post.id])

    const handleCommentAdded = (newComment: any) => {
        setComments((prev: any[]) => [newComment, ...prev])
        setCommentCount((prev: number) => prev + 1)
    }

    const handleLike = async () => {
        try {
            const response = await fetch(`/api/posts/${post.id}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'LIKE' }),
            })

            if (response.ok) {
                setIsLiked(!isLiked)
                setLikeCount((prev: number) => isLiked ? prev - 1 : prev + 1)
            }
        } catch (error) {
            console.error('Error liking post:', error)
        }
    }

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/posts/${post.id}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'SAVE' }),
            })

            if (response.ok) {
                setIsSaved(prev => !prev)
            }
        } catch (error) {
            console.error('Error saving post:', error)
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.content.substring(0, 100),
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    const postTypeLabels: Record<string, string> = {
        CELEBRATION: '🎉 Celebration',
        INSIGHT: '💡 Insight',
        CASE_STUDY: '📘 Case Study',
        SOP: '📋 SOP',
        INCIDENT: '⚠️ Incident',
        COMPANY_UPDATE: '📢 Company Update',
        NEWSLETTER_EDITION: '📰 Newsletter Edition',
    }

    return (
        <div className={styles.container}>
            <Card className={styles.postDetail}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.authorInfo}>
                        <Link href={`/profile/${post.author?.id}`}>
                            <Avatar
                                name={post.author?.name || post.company?.name || 'Unknown'}
                                isPremium={post.author?.isPremium}
                                isVerified={post.company?.verified}
                                size="large"
                            />
                        </Link>
                        <div className={styles.metadata}>
                            <Link href={`/profile/${post.author?.id}`} className={styles.authorName}>
                                {post.author?.name || post.company?.name}
                            </Link>
                            <span className={styles.timestamp}>
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                    <Badge type="post-type" postType={post.postType}>
                        {postTypeLabels[post.postType] || post.postType}
                    </Badge>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <h1 className={styles.title}>{post.title}</h1>
                    <div
                        className={styles.body}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                {/* Media Display */}
                {post.mediaUrl && (
                    <div className={styles.media}>
                        {post.mediaType?.startsWith('image/') && (
                            <img
                                src={post.mediaUrl}
                                alt="Post media"
                                className={styles.mediaImage}
                            />
                        )}
                        {post.mediaType?.startsWith('video/') && (
                            <video
                                src={post.mediaUrl}
                                controls
                                className={styles.mediaVideo}
                            />
                        )}
                        {post.mediaType?.startsWith('application/') && (
                            <a
                                href={post.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mediaDocument}
                            >
                                📄 View Document
                            </a>
                        )}
                    </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className={styles.tags}>
                        {post.tags.map((tag: string) => (
                            <span key={tag} className={styles.tag}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    <Button
                        appearance="subtle"
                        icon={<LikeIcon />}
                        onClick={handleLike}
                        className={isLiked ? styles.liked : ''}
                    >
                        {likeCount}
                    </Button>

                    <Button appearance="subtle" icon={<Comment24Regular />}>
                        {commentCount}
                    </Button>

                    <Button
                        appearance="subtle"
                        icon={<SaveIcon />}
                        onClick={handleSave}
                        className={isSaved ? styles.saved : ''}
                    >
                        Save
                    </Button>

                    <Button
                        appearance="subtle"
                        icon={<Share24Regular />}
                        onClick={handleShare}
                    >
                        Share
                    </Button>

                    <div className={styles.views}>
                        <Eye24Regular />
                        <span>{post.viewCount || 0} views</span>
                    </div>
                </div>
            </Card>

            {/* Comments Section */}
            <Card className={styles.commentsSection}>
                <h2>Comments ({commentCount})</h2>
                <CommentInput postId={post.id} onCommentAdded={handleCommentAdded} />
                {isLoadingComments ? (
                    <p className={styles.loading}>Loading comments...</p>
                ) : (
                    <CommentList comments={comments} />
                )}
            </Card>
        </div>
    )
}
