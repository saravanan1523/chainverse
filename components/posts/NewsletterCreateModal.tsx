'use client'

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Mail24Regular, CheckmarkCircle24Filled, Image24Regular, Info16Regular } from '@fluentui/react-icons'
import styles from './newsletterCreateModal.module.css'

interface NewsletterCreateModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: (newsletter: any) => void
}

export function NewsletterCreateModal({ isOpen, onClose, onCreated }: NewsletterCreateModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [frequency, setFrequency] = useState('Weekly')
    const [isLoading, setIsLoading] = useState(false)
    const [logo, setLogo] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!title.trim() || !description.trim()) return

        setIsLoading(true)
        try {
            const res = await fetch('/api/newsletters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, frequency, logo }),
            })

            if (res.ok) {
                const data = await res.json()
                onCreated(data)
                onClose()
                setTitle('')
                setDescription('')
                setFrequency('Weekly')
                setLogo(null)
            }
        } catch (error) {
            console.error('Failed to create newsletter:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const mockUpload = () => {
        // Just a mock for now
        setLogo('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=300&h=300&fit=crop')
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create a newsletter"
            footer={
                <div className={styles.footer}>
                    <Button
                        appearance="outline"
                        onClick={onClose}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreate}
                        disabled={isLoading || !title.trim() || !description.trim()}
                        className={styles.createButton}
                    >
                        {isLoading ? 'Creating...' : 'Done'}
                    </Button>
                </div>
            }
        >
            <div className={styles.container}>
                <p className={styles.description}>
                    Newsletters on ChainVerse allow you to share your perspective regularly by publishing articles at the cadence you choose. Your subscribers will receive a push notification and email after each new edition of your newsletter. <span className={styles.learnMore}>Learn More</span>
                </p>

                <h3 className={styles.sectionTitle}>Newsletter details</h3>

                <div className={styles.formGrid}>
                    <div>
                        <label className={styles.label}>Newsletter title*</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Add a title to your newsletter"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={styles.label}>How often do you want to publish?*</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className={styles.select}
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Bi-Weekly">Bi-Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={styles.label}>Newsletter description*</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Add a description to your newsletter"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>This description appears alongside your newsletter title</p>
                </div>

                <div className={styles.logoSection}>
                    <div className={styles.logoPlaceholder}>
                        {logo ? <img src={logo} className={styles.logoImage} /> : <Image24Regular style={{ color: 'var(--color-text-secondary)' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--color-text-primary)' }}>Add an image or logo for your newsletter to increase engagement.</p>
                        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>The recommended image size is 300x300 pixels.</p>
                        <Button
                            appearance="outline"
                            onClick={mockUpload}
                            className={styles.uploadButton}
                        >
                            Upload image
                        </Button>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.infoRow}>
                        <div className={styles.iconBox}>
                            <Mail24Regular style={{ color: 'var(--color-text-primary)' }} />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600' }}>Your connections and followers will be invited to subscribe</p>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>We'll notify your network when you publish the first edition of your newsletter and invite new followers to subscribe.</p>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <div className={styles.iconBox}>
                            <CheckmarkCircle24Filled style={{ color: 'var(--color-info)' }} />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600' }}>You will be subscribed to your newsletter</p>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>We'll send you a copy of the notification and email that we send to your subscribers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
