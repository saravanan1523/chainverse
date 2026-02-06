'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { useSession } from 'next-auth/react'
import styles from './CommentInput.module.css'

interface CommentInputProps {
    postId: string
    onCommentAdded: (comment: any) => void
}

export function CommentInput({ postId, onCommentAdded }: CommentInputProps) {
    const { data: session } = useSession()
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            if (response.ok) {
                const newComment = await response.json()
                onCommentAdded(newComment)
                setContent('')
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to post comment')
            }
        } catch (error) {
            console.error('Error posting comment:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!session) return (
        <div className={styles.loginPrompt}>
            Please <a href="/login">sign in</a> to leave a comment.
        </div>
    )

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <Avatar
                name={session.user?.name || ''}
                isPremium={session.user?.isPremium}
                size="small"
            />
            <div className={styles.inputWrapper}>
                <textarea
                    className={styles.textarea}
                    placeholder="Add a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={1}
                />
                <div className={styles.actions}>
                    <Button
                        type="submit"
                        appearance="primary"
                        disabled={!content.trim() || isSubmitting}
                        size="small"
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </div>
        </form>
    )
}
