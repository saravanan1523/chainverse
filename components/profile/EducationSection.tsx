'use client'

import { useState, useEffect } from 'react'
import { Edit24Regular, Add24Regular } from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { ProfileModal } from './ProfileModal'
import styles from './educationSection.module.css'
import modalStyles from './profileModal.module.css'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Education {
    id: string
    school: string
    degree: string
    fieldOfStudy: string | null
    startDate: string
    endDate: string | null
}

export function EducationSection() {
    const params = useParams()
    const { data: session } = useSession()
    // Use URL param if available, otherwise fall back to session user ID
    const userId = (params.id as string) || session?.user?.id
    const [educationList, setEducationList] = useState<Education[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState<Partial<Education>>({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchEducation = async () => {
        if (!userId) {
            setIsLoading(false)
            return
        }
        try {
            const res = await fetch(`/api/profile/education?userId=${userId}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                // Convert to simple year or date string
                const formatted = data.map((e: any) => ({
                    ...e,
                    startDate: new Date(e.startDate).getFullYear().toString(),
                    endDate: e.endDate ? new Date(e.endDate).getFullYear().toString() : 'Present'
                }))
                setEducationList(formatted)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (userId) fetchEducation()
        else if (session !== undefined) setIsLoading(false)
    }, [userId, session])

    const handleAdd = () => {
        setFormData({})
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.school || !formData.degree) return

        try {
            // Convert year inputs to Date objects (Jan 1st)
            const start = new Date(Number(formData.startDate), 0, 1).toISOString()
            const end = formData.endDate && formData.endDate !== 'Present' ? new Date(Number(formData.endDate), 0, 1).toISOString() : null

            await fetch('/api/profile/education', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    school: formData.school,
                    degree: formData.degree,
                    fieldOfStudy: formData.fieldOfStudy,
                    startDate: start,
                    endDate: end
                })
            })
            fetchEducation()
            setIsModalOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Education</h2>
                <div className={styles.headerActions}>
                    <Button
                        icon={<Add24Regular />}
                        appearance="subtle"
                        size="small"
                        onClick={handleAdd}
                    />
                </div>
            </div>

            <div className={styles.educationList}>
                {isLoading && <div style={{ color: 'var(--color-text-tertiary)', padding: '16px' }}>Loading education...</div>}

                {!isLoading && educationList.length === 0 && (
                    <div style={{ color: 'var(--color-text-tertiary)', padding: '16px' }}>No education listed.</div>
                )}

                {educationList.map((edu, index) => (
                    <div key={edu.id} className={styles.education}>
                        {index > 0 && <div className={styles.divider} />}

                        <div className={styles.schoolLogo}>
                            <div className={styles.logoPlaceholder}>
                                {edu.school.charAt(0)}
                            </div>
                        </div>

                        <div className={styles.details}>
                            <h3 className={styles.school}>{edu.school}</h3>
                            <p className={styles.degree}>
                                {edu.degree}, {edu.fieldOfStudy}
                            </p>
                            <p className={styles.years}>
                                {edu.startDate} - {edu.endDate || 'Present'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <ProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add education"
                onSave={handleSave}
            >
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>School*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.school || ''}
                        onChange={e => setFormData({ ...formData, school: e.target.value })}
                        placeholder="Ex: Boston University"
                    />
                </div>

                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Degree*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.degree || ''}
                        onChange={e => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="Ex: Bachelor's"
                    />
                </div>

                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Field of study</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.fieldOfStudy || ''}
                        onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                        placeholder="Ex: Business"
                    />
                </div>

                <div className={modalStyles.row}>
                    <div className={modalStyles.col}>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.label}>Start Year</label>
                            <input
                                type="number"
                                className={modalStyles.input}
                                value={formData.startDate || ''}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                placeholder="YYYY"
                            />
                        </div>
                    </div>
                    <div className={modalStyles.col}>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.label}>End Year</label>
                            <input
                                type="number"
                                className={modalStyles.input}
                                value={formData.endDate || ''}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                placeholder="YYYY"
                            />
                        </div>
                    </div>
                </div>
            </ProfileModal>
        </div>
    )
}
