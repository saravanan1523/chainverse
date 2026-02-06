'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
    Image24Regular,
    DocumentText24Regular,
    DocumentBulletList24Regular,
    Megaphone24Regular
} from '@fluentui/react-icons'
import { CreatePostModal } from './CreatePostModal'
import { ArticleEditorModal } from './ArticleEditorModal'
import styles from './createPostCard.module.css'

const quickActions = [
    { icon: Image24Regular, label: 'Photo', color: '#0078d4', type: 'photo' },
    { icon: DocumentText24Regular, label: 'Write article', color: '#c43e1c', type: 'article' },
    { icon: DocumentBulletList24Regular, label: 'Case study', color: '#107c10', type: 'case-study' },
    { icon: Megaphone24Regular, label: 'Share update', color: '#5c2d91', type: 'update' },
]

interface CreatePostCardProps {
    groupId?: string
}

export function CreatePostCard({ groupId }: CreatePostCardProps) {
    const { data: session } = useSession()
    const [activeModal, setActiveModal] = useState<'simple' | 'article' | 'case-study' | null>(null)

    if (!session?.user) return null

    const userInitial = session.user.name?.charAt(0).toUpperCase() || 'U'

    const handleActionClick = (type: string) => {
        if (type === 'article') {
            setActiveModal('article')
        } else if (type === 'case-study') {
            setActiveModal('case-study')
        } else {
            setActiveModal('simple')
        }
    }

    return (
        <>
            <div className={styles.card}>
                <div
                    className={styles.inputSection}
                    onClick={() => setActiveModal('simple')}
                >
                    <div className={styles.avatar}>
                        {userInitial}
                    </div>
                    <div className={styles.input}>
                        What do you want to share?
                    </div>
                </div>

                <div className={styles.actions}>
                    {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                            <button
                                key={action.label}
                                className={styles.actionButton}
                                onClick={() => handleActionClick(action.type)}
                            >
                                <Icon className={styles.actionIcon} style={{ color: action.color }} />
                                <span>{action.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <CreatePostModal
                isOpen={activeModal === 'simple'}
                onClose={() => setActiveModal(null)}
                groupId={groupId}
            />

            <ArticleEditorModal
                isOpen={activeModal === 'article' || activeModal === 'case-study'}
                onClose={() => setActiveModal(null)}
                postType={activeModal === 'case-study' ? 'case-study' : 'article'}
            />
        </>
    )
}
