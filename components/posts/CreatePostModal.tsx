'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
    Emoji24Regular,
    Image24Regular,
    Calendar24Regular,
    Document24Regular,
    MoreHorizontal24Regular,
    Clock24Regular,
    Sparkle24Filled,
    CaretDown16Filled,
    Add24Regular,
    Dismiss24Regular
} from '@fluentui/react-icons'
import { FileUpload, EmojiPickerButton } from './FileUpload'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import styles from './createPostModal.module.css'
import uploadStyles from './FileUpload.module.css'

interface CreatePostModalProps {
    isOpen: boolean
    onClose: () => void
    postType?: 'default' | 'media' | 'event'
    groupId?: string
}

export function CreatePostModal({ isOpen, onClose, postType = 'default', groupId }: CreatePostModalProps) {
    const { data: session } = useSession()
    const [content, setContent] = useState('')
    const [isRewriting, setIsRewriting] = useState(false)
    const [mediaUrl, setMediaUrl] = useState<string | null>(null)
    const [mediaType, setMediaType] = useState<string | null>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const documentInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const userInitial = session?.user?.name?.charAt(0).toUpperCase() || 'U'
    const userName = session?.user?.name || 'User'

    const handleRewrite = async () => {
        if (!content.trim()) {
            alert('Please enter some content first')
            return
        }

        setIsRewriting(true)
        try {
            const response = await fetch('/api/ai/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            if (response.ok) {
                const data = await response.json()
                setContent(data.content)
            } else {
                const error = await response.json()
                alert(error.details || 'Failed to rewrite content. Please try again.')
            }
        } catch (error) {
            console.error('Error rewriting content:', error)
            alert('An error occurred while rewriting. Please try again.')
        } finally {
            setIsRewriting(false)
        }
    }

    const handleMediaUpload = (url: string, type: string) => {
        setMediaUrl(url)
        setMediaType(type)
    }

    const handleMediaError = (error: string) => {
        alert(error)
    }

    const handleRemoveMedia = () => {
        setMediaUrl(null)
        setMediaType(null)
    }

    const handleEmojiSelect = (emojiData: EmojiClickData) => {
        const emoji = emojiData.emoji
        const textarea = textareaRef.current
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newContent = content.substring(0, start) + emoji + content.substring(end)
            setContent(newContent)
            // Set cursor position after emoji
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + emoji.length
                textarea.focus()
            }, 0)
        } else {
            setContent(content + emoji)
        }
        setShowEmojiPicker(false)
    }

    const handlePost = async () => {
        if (!content.trim()) return

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postType: 'INSIGHT',
                    title: content.substring(0, 100),
                    content: content,
                    tags: [],
                    mediaUrl: mediaUrl,
                    mediaType: mediaType,
                    groupId: groupId,
                }),
            })

            if (response.ok) {
                onClose()
                setContent('')
                setMediaUrl(null)
                setMediaType(null)
                window.location.reload()
            } else {
                console.error('Failed to create post')
                alert('Failed to create post. Please try again.')
            }
        } catch (error) {
            console.error('Error creating post:', error)
            alert('An error occurred while creating the post.')
        }
    }

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
        }}>
            <div className={styles.modal}>
                {/* Close Button */}
                <button className={styles.closeButton} onClick={onClose}>
                    <Dismiss24Regular />
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {userInitial}
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>
                            {userName} <CaretDown16Filled />
                        </div>
                        <button className={styles.audienceButton}>
                            Post to Anyone <CaretDown16Filled />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={styles.content}>
                    <textarea
                        ref={textareaRef}
                        className={styles.textarea}
                        placeholder="What do you want to talk about?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        autoFocus
                    />
                    <button
                        className={styles.emojiButton}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        type="button"
                    >
                        <Emoji24Regular />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className={uploadStyles.emojiPickerPopup}>
                            <EmojiPicker onEmojiClick={handleEmojiSelect} />
                        </div>
                    )}

                    {/* Media Preview */}
                    {mediaUrl && (
                        <div className={uploadStyles.mediaPreview}>
                            {mediaType?.startsWith('image/') && (
                                <>
                                    <img src={mediaUrl} alt="Upload preview" className={uploadStyles.previewImage} />
                                    <button className={uploadStyles.removeButton} onClick={handleRemoveMedia}>
                                        <Dismiss24Regular />
                                    </button>
                                </>
                            )}
                            {mediaType?.startsWith('video/') && (
                                <>
                                    <video src={mediaUrl} controls className={uploadStyles.previewVideo} />
                                    <button className={uploadStyles.removeButton} onClick={handleRemoveMedia}>
                                        <Dismiss24Regular />
                                    </button>
                                </>
                            )}
                            {mediaType?.startsWith('application/') && (
                                <div className={uploadStyles.previewDocument}>
                                    <div className={uploadStyles.documentIcon}>📄</div>
                                    <div className={uploadStyles.documentInfo}>
                                        <div className={uploadStyles.documentName}>Document attached</div>
                                    </div>
                                    <button className={uploadStyles.removeButton} onClick={handleRemoveMedia}>
                                        <Dismiss24Regular />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Hidden File Inputs */}
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            const formData = new FormData()
                            formData.append('file', file)
                            formData.append('type', 'image')
                            try {
                                const response = await fetch('/api/upload', { method: 'POST', body: formData })
                                if (response.ok) {
                                    const data = await response.json()
                                    handleMediaUpload(data.url, data.type)
                                } else {
                                    const error = await response.json()
                                    handleMediaError(error.details || 'Upload failed')
                                }
                            } catch (error) {
                                handleMediaError('Failed to upload image')
                            }
                        }
                    }}
                    style={{ display: 'none' }}
                />
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            const formData = new FormData()
                            formData.append('file', file)
                            formData.append('type', 'video')
                            try {
                                const response = await fetch('/api/upload', { method: 'POST', body: formData })
                                if (response.ok) {
                                    const data = await response.json()
                                    handleMediaUpload(data.url, data.type)
                                } else {
                                    const error = await response.json()
                                    handleMediaError(error.details || 'Upload failed')
                                }
                            } catch (error) {
                                handleMediaError('Failed to upload video')
                            }
                        }
                    }}
                    style={{ display: 'none' }}
                />
                <input
                    ref={documentInputRef}
                    type="file"
                    accept="application/pdf,.doc,.docx"
                    onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            const formData = new FormData()
                            formData.append('file', file)
                            formData.append('type', 'document')
                            try {
                                const response = await fetch('/api/upload', { method: 'POST', body: formData })
                                if (response.ok) {
                                    const data = await response.json()
                                    handleMediaUpload(data.url, data.type)
                                } else {
                                    const error = await response.json()
                                    handleMediaError(error.details || 'Upload failed')
                                }
                            } catch (error) {
                                handleMediaError('Failed to upload document')
                            }
                        }
                    }}
                    style={{ display: 'none' }}
                />

                {/* Footer Toolbar */}
                <div className={styles.footer}>
                    <div className={styles.footerTools}>
                        <div className={styles.leftTools}>
                            <button
                                className={styles.rewriteButton}
                                onClick={handleRewrite}
                                disabled={isRewriting || !content.trim()}
                            >
                                <Sparkle24Filled />
                                {isRewriting ? 'Rewriting...' : 'Rewrite with AI'}
                            </button>

                            <div className={styles.mediaButtons}>
                                <button
                                    className={styles.mediaButton}
                                    title="Add media"
                                    onClick={() => imageInputRef.current?.click()}
                                    type="button"
                                >
                                    <Image24Regular />
                                </button>
                                <button
                                    className={styles.mediaButton}
                                    title="Add video"
                                    onClick={() => videoInputRef.current?.click()}
                                    type="button"
                                >
                                    <Calendar24Regular />
                                </button>
                                <button
                                    className={styles.mediaButton}
                                    title="Add document"
                                    onClick={() => documentInputRef.current?.click()}
                                    type="button"
                                >
                                    <Document24Regular />
                                </button>
                                <button className={styles.mediaButton} title="More">
                                    <Add24Regular />
                                </button>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <button className={styles.scheduleButton} title="Schedule for later">
                                <Clock24Regular />
                            </button>

                            <button
                                className={`${styles.postButton} ${content.trim() ? styles.postButtonActive : ''}`}
                                disabled={!content.trim()}
                                onClick={handlePost}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
