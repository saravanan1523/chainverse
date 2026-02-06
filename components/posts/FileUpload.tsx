'use client'

import { useState, useRef } from 'react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import styles from './FileUpload.module.css'

interface FileUploadProps {
    type: 'image' | 'video' | 'document'
    onUpload: (url: string, fileType: string) => void
    onError: (error: string) => void
}

export function FileUpload({ type, onUpload, onError }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const acceptTypes = {
        image: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
        video: 'video/mp4,video/webm,video/quicktime',
        document: 'application/pdf,.doc,.docx',
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                onUpload(data.url, data.type)
            } else {
                const error = await response.json()
                onError(error.details || error.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Upload error:', error)
            onError('Failed to upload file. Please try again.')
        } finally {
            setIsUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes[type]}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
            {isUploading && <div className={styles.uploadingIndicator}>Uploading...</div>}
        </>
    )
}

interface EmojiPickerButtonProps {
    onEmojiSelect: (emoji: string) => void
}

export function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
    const [showPicker, setShowPicker] = useState(false)
    const pickerRef = useRef<HTMLDivElement>(null)

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji)
        setShowPicker(false)
    }

    // Close picker when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
            setShowPicker(false)
        }
    }

    // Add/remove event listener
    if (typeof window !== 'undefined') {
        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }

    return (
        <div className={styles.emojiPickerContainer} ref={pickerRef}>
            {showPicker && (
                <div className={styles.emojiPickerPopup}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}
        </div>
    )
}
