'use client'

import { useState, useEffect } from 'react'
import { Edit24Regular, Add24Regular } from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { ProfileModal } from './ProfileModal'
import styles from './experienceSection.module.css'
import modalStyles from './profileModal.module.css'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Experience {
    id: string
    title: string
    company: string
    location: string | null
    startDate: string
    endDate: string | null
    current: boolean
    description: string | null
}

export function ExperienceSection() {
    const params = useParams()
    const { data: session } = useSession()
    // Use URL param if available, otherwise fall back to session user ID
    const userId = (params.id as string) || session?.user?.id
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState<Partial<Experience>>({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchExperience = async () => {
        if (!userId) {
            setIsLoading(false)
            return
        }
        try {
            const res = await fetch(`/api/profile/experience?userId=${userId}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                // Convert DB dates to string format for display/editing
                const formatted = data.map((e: any) => ({
                    ...e,
                    startDate: new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    endDate: e.endDate ? new Date(e.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'
                }))
                setExperiences(formatted)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (userId) fetchExperience()
        else if (session !== undefined) setIsLoading(false)
    }, [userId, session])

    const handleAdd = () => {
        setFormData({})
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.title || !formData.company) return

        try {
            await fetch('/api/profile/experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    // Simple date parsing or sending ISO if input type=date. 
                    // For now assuming user inputs "Jan 2023" type string manually or we add a date picker later. 
                    // Let's assume date input is simple ISO or convertible string for now.
                    startDate: new Date(formData.startDate!).toISOString(),
                    endDate: formData.endDate && formData.endDate !== 'Present' ? new Date(formData.endDate).toISOString() : null,
                    current: formData.endDate === 'Present'
                })
            })
            fetchExperience()
            setIsModalOpen(false)
        } catch (error) {
            console.error('Failed to save experience', error)
        }
    }

    // Checking if we should show editing controls (simplified: always show for now, ideally check session user match)
    // For demo purposes, we will assume if you can see buttons you can edit.

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Experience</h2>
                <div className={styles.headerActions}>
                    <Button
                        icon={<Add24Regular />}
                        appearance="subtle"
                        size="small"
                        onClick={handleAdd}
                    />
                </div>
            </div>

            <div className={styles.experiences}>
                {isLoading && <div style={{ color: 'var(--color-text-tertiary)', padding: '16px' }}>Loading experience...</div>}

                {!isLoading && experiences.length === 0 && (
                    <div style={{ color: 'var(--color-text-tertiary)', padding: '16px' }}>No experience listed.</div>
                )}

                {experiences.map((exp, index) => (
                    <div key={exp.id} className={styles.experience}>
                        {index > 0 && <div className={styles.divider} />}

                        <div className={styles.companyLogo}>
                            <div className={styles.logoPlaceholder}>
                                {exp.company.charAt(0)}
                            </div>
                        </div>

                        <div className={styles.details}>
                            <h3 className={styles.jobTitle}>{exp.title}</h3>
                            <p className={styles.company}>{exp.company}</p>
                            <p className={styles.dates}>
                                {exp.startDate} - {exp.endDate || 'Present'}
                            </p>
                            <p className={styles.location}>{exp.location}</p>
                            <p className={styles.description}>{exp.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <ProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add experience"
                onSave={handleSave}
            >
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Title*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Retail Sales Manager"
                    />
                </div>

                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Company name*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.company || ''}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Ex: Microsoft"
                    />
                </div>

                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Location</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.location || ''}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: London, United Kingdom"
                    />
                </div>

                <div className={modalStyles.row}>
                    <div className={modalStyles.col}>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.label}>Start Date</label>
                            <input
                                type="date"
                                className={modalStyles.input}
                                value={formData.startDate || ''}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Description</label>
                    <textarea
                        className={modalStyles.textarea}
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </ProfileModal>
        </div>
    )
}
