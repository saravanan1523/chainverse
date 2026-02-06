'use client'

import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { SharePostModal } from './SharePostModal'
import {
    Heart24Regular,
    Heart24Filled,
    Comment24Regular,
    BookmarkRegular,
    BookmarkFilled,
    Eye24Regular,
    Share24Regular,
    Document24Regular,
    Sparkle24Filled,
} from '@fluentui/react-icons'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import styles from './PostCard.module.css'
import { useState } from 'react'

interface PostCardProps {
    post: any // We'll type this properly later
    onLike?: () => void
    onSave?: () => void
    isLiked?: boolean
    isSaved?: boolean
}

export function PostCard({ post, onLike, onSave, isLiked, isSaved }: PostCardProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const LikeIcon = isLiked ? Heart24Filled : Heart24Regular
    const SaveIcon = isSaved ? BookmarkFilled : BookmarkRegular

    // Get post type label
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
        <Card className={styles.postCard}>
            <div className={styles.header}>
                <div className={styles.authorInfo}>
                    <Link href={`/profile/${post.author?.id}`}>
                        <Avatar
                            name={post.author?.name || post.company?.name || 'Unknown'}
                            isPremium={post.author?.isPremium}
                            isVerified={post.company?.verified}
                            size="medium"
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

            <Link href={`/post/${post.id}`} className={styles.content}>
                {post.postType !== 'INSIGHT' && (
                    <h3 className={styles.title}>{post.title}</h3>
                )}
                <div
                    className={styles.excerpt}
                    dangerouslySetInnerHTML={{
                        __html: post.content.substring(0, 300) + (post.content.length > 300 ? '...' : ''),
                    }}
                />
            </Link>

            {/* Media & Attachments Display */}
            {post.attachments && post.attachments.length > 0 ? (
                <div className={styles.attachmentsGrid}>
                    {post.attachments.map((att: any, idx: number) => (
                        <div key={att.id || idx} className={styles.attachmentItem}>
                            {att.type.startsWith('image/') ? (
                                <img
                                    src={att.url}
                                    alt={att.name || 'Attachment'}
                                    className={styles.attachmentImage}
                                />
                            ) : att.type.startsWith('video/') ? (
                                <video
                                    src={att.url}
                                    controls
                                    className={styles.attachmentVideo}
                                />
                            ) : (
                                <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.attachmentDocument}
                                >
                                    <Document24Regular />
                                    <div className={styles.docMeta}>
                                        <span className={styles.docName}>{att.name || 'Document'}</span>
                                        {att.size && (
                                            <span className={styles.docSize}>
                                                {(att.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                        )}
                                    </div>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            ) : post.mediaUrl && (
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

            {post.tags && post.tags.length > 0 && (
                <div className={styles.tags}>
                    {post.tags.map((tag: string) => (
                        <span key={tag} className={styles.tag}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className={styles.actions}>
                <Button
                    appearance="subtle"
                    icon={<LikeIcon />}
                    onClick={onLike}
                    className={isLiked ? styles.liked : ''}
                >
                    {post._count?.reactions || 0}
                </Button>

                <Link href={`/post/${post.id}#comments`}>
                    <Button appearance="subtle" icon={<Comment24Regular />}>
                        {post._count?.comments || 0}
                    </Button>
                </Link>

                <Button
                    appearance="subtle"
                    icon={<SaveIcon />}
                    onClick={onSave}
                    className={isSaved ? styles.saved : ''}
                >
                    Save
                </Button>

                <Button
                    appearance="subtle"
                    icon={<Share24Regular />}
                    onClick={() => setIsShareModalOpen(true)}
                >
                    Share
                </Button>

                <div className={styles.views}>
                    <Eye24Regular />
                    <span>{post.viewCount || 0}</span>
                </div>
            </div>

            <SharePostModal
                postId={post.id}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
        </Card>
    )
}
