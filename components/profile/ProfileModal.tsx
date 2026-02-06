'use client'

import { Dismiss24Regular } from '@fluentui/react-icons'
import styles from './profileModal.module.css'

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    onSave: () => void
    children: React.ReactNode
    isSaving?: boolean
}

export function ProfileModal({ isOpen, onClose, title, onSave, children, isSaving = false }: ProfileModalProps) {
    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
        }}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <Dismiss24Regular />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {children}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        className={styles.saveButton}
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}
