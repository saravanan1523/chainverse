'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    TextBold24Regular,
    TextItalic24Regular,
    TextUnderline24Regular,
    TextNumberListLtr24Regular,
    TextBulletListLtr24Regular,
    TextQuote24Regular,
    Code24Regular,
    Link24Regular,
    Image24Regular,
    CaretDown16Filled,
    ArrowRight16Filled,
    MoreHorizontal24Regular,
    Dismiss24Regular,
    Document24Regular,
    Delete24Regular,
    ArrowUp24Regular,
    Sparkle24Regular,
    Sparkle24Filled
} from '@fluentui/react-icons'
import styles from './articleEditorModal.module.css'
import { NewsletterCreateModal } from './NewsletterCreateModal'

interface ArticleEditorModalProps {
    isOpen: boolean
    onClose: () => void
    postType?: 'article' | 'case-study'
}

export function ArticleEditorModal({ isOpen, onClose, postType = 'article' }: ArticleEditorModalProps) {
    const { data: session } = useSession()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [attachments, setAttachments] = useState<any[]>([])
    const [isManageOpen, setIsManageOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false)
    const [userNewsletters, setUserNewsletters] = useState<any[]>([])
    const [selectedNewsletterId, setSelectedNewsletterId] = useState<string | null>(null)
    const [isPublished, setIsPublished] = useState(true)
    const [scheduledFor, setScheduledFor] = useState<string | null>(null)
    const [isScheduling, setIsScheduling] = useState(false)
    const [isAIProcessing, setIsAIProcessing] = useState(false)
    const [originalContent, setOriginalContent] = useState<string | null>(null)

    const handleAIImprove = async () => {
        if (!content.trim() || isAIProcessing) return

        setIsAIProcessing(true)
        try {
            const res = await fetch('/api/ai/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            if (res.ok) {
                const data = await res.json()
                setOriginalContent(content)
                setContent(data.rewritten)
            } else {
                const error = await res.json()
                console.error(error.error || 'Failed to improve content with AI')
            }
        } catch (error) {
            console.error('AI Rewrite Error:', error)
            alert('An unexpected error occurred while using AI.')
        } finally {
            setIsAIProcessing(false)
        }
    }

    const handleUndoAI = () => {
        if (originalContent !== null) {
            setContent(originalContent)
            setOriginalContent(null)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('type', file.type)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (res.ok) {
                    const data = await res.json()
                    setAttachments(prev => [...prev, {
                        url: data.url,
                        type: data.type,
                        name: file.name,
                        size: file.size
                    }])
                }
            }
        } catch (error) {
            console.error('Upload Error:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const removeAttachment = (url: string) => {
        setAttachments(prev => prev.filter(att => att.url !== url))
    }

    useEffect(() => {
        const fetchUserNewsletters = async () => {
            if (session?.user?.id) {
                try {
                    const res = await fetch(`/api/newsletters?ownerId=${session.user.id}`)
                    if (res.ok) {
                        const data = await res.json()
                        setUserNewsletters(data)
                    }
                } catch (error) {
                    console.error('Failed to fetch user newsletters:', error)
                }
            }
        }
        if (isOpen) fetchUserNewsletters()
    }, [isOpen, session?.user?.id])

    if (!isOpen) return null

    const userName = session?.user?.name || 'User'
    const userInitial = userName.charAt(0).toUpperCase()

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) return

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postType: selectedNewsletterId ? 'NEWSLETTER_EDITION' : 'INSIGHT',
                    title,
                    content,
                    tags: [],
                    newsletterId: selectedNewsletterId,
                    isPublished,
                    scheduledFor: isScheduling ? scheduledFor : null,
                    attachments: attachments.map(att => ({
                        url: att.url,
                        type: att.type,
                        name: att.name,
                        size: att.size
                    }))
                }),
            })

            if (res.ok) {
                // Close and reset
                onClose()
                setTitle('')
                setContent('')
                setAttachments([])
                setSelectedNewsletterId(null)
            }
        } catch (error) {
            console.error('Failed to publish:', error)
        }
    }

    const toggleManage = () => setIsManageOpen(!isManageOpen)

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Top Navigation Bar */}
                <div className={styles.topBar}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {userInitial}
                        </div>
                        <div className={styles.userMeta}>
                            <div className={styles.userName}>
                                {userName} <CaretDown16Filled />
                            </div>
                            <span className={styles.postType}>
                                {postType === 'case-study' ? 'Individual case study' : 'Individual article'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.topActions}>
                        <button className={styles.manageButton} onClick={toggleManage}>
                            Manage <CaretDown16Filled />
                        </button>
                        <button
                            className={styles.nextButton}
                            disabled={!title.trim() || !content.trim()}
                            onClick={handlePublish}
                        >
                            Next <ArrowRight16Filled />
                        </button>
                    </div>
                </div>

                {/* Manage Dropdown */}
                {isManageOpen && (
                    <>
                        <div
                            style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
                            onClick={() => setIsManageOpen(false)}
                        />
                        <div className={styles.dropdownMenu}>
                            <button className={styles.menuItem}>Settings</button>
                            <button className={styles.menuItem}>Drafts</button>
                            <div className={styles.menuDivider} />
                            <button className={styles.menuItem}>Scheduled</button>
                            <button className={styles.menuItem}>Published</button>
                            <div className={styles.menuDivider} />
                            <button className={styles.menuItem}>New draft</button>
                            <button
                                className={styles.menuItem}
                                onClick={() => {
                                    setIsNewsletterModalOpen(true)
                                    setIsManageOpen(false)
                                }}
                            >
                                Create newsletter
                            </button>
                            <div className={styles.menuDivider} />
                            <button className={styles.menuItem}>Help</button>
                            <button className={styles.menuItem}>Give feedback</button>
                        </div>
                    </>
                )}

                {/* Formatting Toolbar */}
                <div className={styles.toolbar}>
                    <button className={styles.styleDropdown}>
                        Style <CaretDown16Filled />
                    </button>

                    <div className={styles.divider} />

                    <button className={styles.toolButton} title="Bold">
                        <TextBold24Regular />
                    </button>
                    <button className={styles.toolButton} title="Italic">
                        <TextItalic24Regular />
                    </button>
                    <button className={styles.toolButton} title="Underline">
                        <TextUnderline24Regular />
                    </button>

                    <div className={styles.divider} />

                    <button className={styles.toolButton} title="Ordered List">
                        <TextNumberListLtr24Regular />
                    </button>
                    <button className={styles.toolButton} title="Unordered List">
                        <TextBulletListLtr24Regular />
                    </button>

                    <div className={styles.divider} />

                    <button className={styles.toolButton} title="Quote">
                        <TextQuote24Regular />
                    </button>
                    <button className={styles.toolButton} title="Code">
                        <Code24Regular />
                    </button>

                    <div className={styles.divider} />

                    <button className={styles.toolButton} title="Link">
                        <Link24Regular />
                    </button>
                    <button className={styles.toolButton} title="Image">
                        <Image24Regular />
                    </button>

                    <div className={styles.divider} />

                    {originalContent && (
                        <button className={styles.undoButton} onClick={handleUndoAI}>
                            Undo AI
                        </button>
                    )}

                    <button
                        className={`${styles.aiButton} ${isAIProcessing ? styles.processing : ''}`}
                        onClick={handleAIImprove}
                        disabled={isAIProcessing || !content.trim()}
                    >
                        {isAIProcessing ? <Sparkle24Filled /> : <Sparkle24Regular />}
                        {isAIProcessing ? 'Improving...' : 'Improve with AI'}
                    </button>
                </div>

                {/* Editor Area */}
                <div className={styles.editorContainer}>
                    <div className={styles.editorWidth}>
                        {/* Attachments Section */}
                        {attachments.length > 0 && (
                            <div className={styles.attachmentsGrid}>
                                {attachments.map((att, idx) => (
                                    <div key={idx} className={styles.attachmentItem}>
                                        {att.type.startsWith('image/') ? (
                                            <img src={att.url} alt={att.name} className={styles.attachmentPreview} />
                                        ) : att.type.startsWith('video/') ? (
                                            <div className={styles.attachmentFileIcon}>
                                                <Image24Regular />
                                                <span style={{ fontSize: '10px' }}>Video</span>
                                            </div>
                                        ) : (
                                            <div className={styles.attachmentFileIcon}>
                                                <Document24Regular />
                                                <span className={styles.fileName}>{att.name}</span>
                                            </div>
                                        )}
                                        <button
                                            className={styles.removeAttachment}
                                            onClick={() => removeAttachment(att.url)}
                                        >
                                            <Delete24Regular />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Cover Image Upload (Fallback for legacy or main image) */}
                        {attachments.length === 0 && (
                            <div className={styles.coverImageSection}>
                                <div className={styles.coverPlaceholder}>
                                    <Image24Regular />
                                </div>
                                <span className={styles.coverText}>
                                    Add a cover image or video to your {postType === 'case-study' ? 'case study' : 'article'}.
                                </span>
                                <button
                                    className={styles.uploadButton}
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    disabled={isUploading}
                                >
                                    <ArrowUp24Regular />
                                    {isUploading ? 'Uploading...' : 'Upload from computer'}
                                </button>
                            </div>
                        )}

                        {/* Title Input */}
                        <input
                            type="text"
                            className={styles.titleInput}
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {/* Content TextArea */}
                        <textarea
                            className={styles.contentEditor}
                            placeholder="Write here. You can also include @mentions."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        {userNewsletters.length > 0 && (
                            <div className={styles.publishSection}>
                                <h4 className={styles.publishTitle}>Publish to Newsletter</h4>
                                <div className={styles.newsletterOptions}>
                                    <button
                                        onClick={() => setSelectedNewsletterId(null)}
                                        className={`${styles.newsletterOption} ${selectedNewsletterId === null ? styles.active : ''}`}
                                    >
                                        Standard Article
                                    </button>
                                    {userNewsletters.map(nl => (
                                        <button
                                            key={nl.id}
                                            onClick={() => setSelectedNewsletterId(nl.id)}
                                            className={`${styles.newsletterOption} ${selectedNewsletterId === nl.id ? styles.active : ''}`}
                                        >
                                            {nl.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Publish Settings */}
                        <div className={styles.publishSection}>
                            <h4 className={styles.publishTitle}>Publish Settings</h4>
                            <div className={styles.publishOptions}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={isPublished}
                                        onChange={(e) => setIsPublished(e.target.checked)}
                                    />
                                    <span>Publish immediately</span>
                                </label>

                                {!isPublished && (
                                    <div className={styles.draftNotice}>
                                        This will be saved as a draft. You can find it in your Manage &gt; Drafts section.
                                    </div>
                                )}

                                {isPublished && (
                                    <div className={styles.scheduleContainer}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={isScheduling}
                                                onChange={(e) => setIsScheduling(e.target.checked)}
                                            />
                                            <span>Schedule for later</span>
                                        </label>

                                        {isScheduling && (
                                            <input
                                                type="datetime-local"
                                                value={scheduledFor || ''}
                                                onChange={(e) => setScheduledFor(e.target.value)}
                                                className={styles.dateInput}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <NewsletterCreateModal
                isOpen={isNewsletterModalOpen}
                onClose={() => setIsNewsletterModalOpen(false)}
                onCreated={(newNl) => {
                    setUserNewsletters(prev => [newNl, ...prev])
                    setSelectedNewsletterId(newNl.id)
                }}
            />

            {/* Close functionality usually on top right for full screen, but specific design might differ. 
                Added escape hatch or user can click 'Next' to proceed. 
                For now valid close is to refresh or back, but let's add a close button for usability if needed. 
                LinkedIn actually uses browser back or a dedicated close icon if it's a modal over feed.
                Let's stick to the image which shows a full page experience almost.
                Use 'X' on top right if not covered by top bar actions. 
                The provided image doesn't show an X, but standard UX suggests one.
            */}
            <button
                className={styles.toolButton}
                style={{ position: 'absolute', top: '12px', right: '16px', zIndex: 1100 }}
                onClick={onClose}
            >
                <Dismiss24Regular />
            </button>
        </div >
    )
}
