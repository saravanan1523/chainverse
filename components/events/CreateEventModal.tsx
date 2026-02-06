'use client'

import { useState } from 'react'
import {
    Calendar24Regular,
    Location24Regular,
    Link24Regular,
    Dismiss24Regular
} from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import styles from './createEventModal.module.css'

interface CreateEventModalProps {
    isOpen: boolean
    onClose: () => void
    onEventCreated: () => void
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        link: '',
        isOnline: true
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Combine date and time
            const startTime = new Date(`${formData.date}T${formData.time}`).toISOString()

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    startTime
                })
            })

            if (res.ok) {
                onEventCreated()
                onClose()
                setFormData({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    location: '',
                    link: '',
                    isOnline: true
                })
            }
        } catch (error) {
            console.error('Failed to create event', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Create Event</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <Dismiss24Regular />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Event Title*</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Supply Chain Tech Summit"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description*</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What is this event about?"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Date*</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Time*</label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Event Type</label>
                        <div className={styles.typeSelector}>
                            <button
                                type="button"
                                className={formData.isOnline ? styles.activeType : ''}
                                onClick={() => setFormData({ ...formData, isOnline: true })}
                            >
                                Online
                            </button>
                            <button
                                type="button"
                                className={!formData.isOnline ? styles.activeType : ''}
                                onClick={() => setFormData({ ...formData, isOnline: false })}
                            >
                                In Person
                            </button>
                        </div>
                    </div>

                    {formData.isOnline ? (
                        <div className={styles.formGroup}>
                            <label>Link</label>
                            <div className={styles.inputWithIcon}>
                                <Link24Regular />
                                <input
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://zoom.us/..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.formGroup}>
                            <label>Location</label>
                            <div className={styles.inputWithIcon}>
                                <Location24Regular />
                                <input
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="City, Address"
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Button appearance="subtle" onClick={onClose} type="button">Cancel</Button>
                        <Button appearance="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
