'use client'

import { useState, useEffect } from 'react'
import { Edit24Regular, Add24Regular } from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { ProfileModal } from './ProfileModal'
import styles from './languagesSection.module.css'
import modalStyles from './profileModal.module.css'
import type { Language } from '@prisma/client'





const proficiencyOptions = [
    'Native or bilingual proficiency',
    'Full professional proficiency',
    'Professional working proficiency',
    'Limited working proficiency',
    'Elementary proficiency'
]

interface SkillsSectionProps {
    userId?: string
}

export function LanguagesSection({ userId }: SkillsSectionProps) {
    const [languages, setLanguages] = useState<Language[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [formData, setFormData] = useState<Partial<Language>>({ language: '', proficiency: proficiencyOptions[2] })

    const fetchLanguages = async () => {
        if (!userId) return
        try {
            const res = await fetch(`/api/profile/languages?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setLanguages(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLanguages()
    }, [userId])

    const handleAdd = () => {
        setFormData({ language: '', proficiency: proficiencyOptions[2] })
        setIsAddModalOpen(true)
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setFormData(languages[index])
        setIsEditModalOpen(true)
    }

    const handleSaveNew = async () => {
        if (!formData.language?.trim()) return
        try {
            const res = await fetch('/api/profile/languages', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                fetchLanguages()
                setIsAddModalOpen(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleSaveEdit = async () => {
        if (editingIndex === null || !formData.language?.trim()) return
        try {
            const res = await fetch('/api/profile/languages', {
                method: 'PATCH',
                body: JSON.stringify({ ...formData, id: languages[editingIndex].id }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                fetchLanguages()
                setIsEditModalOpen(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async () => {
        if (editingIndex === null) return
        try {
            const res = await fetch(`/api/profile/languages?id=${languages[editingIndex].id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchLanguages()
                setIsEditModalOpen(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <div className={styles.section}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Languages</h2>
                    <div className={styles.headerActions}>
                        <Button
                            icon={<Add24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={handleAdd}
                        />
                        <Button
                            icon={<Edit24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => languages.length > 0 && handleEdit(0)}
                        />
                    </div>
                </div>

                <div className={styles.languages}>
                    {languages.map((lang, index) => (
                        <div
                            key={lang.language}
                            className={styles.language}
                            onClick={() => handleEdit(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            {index > 0 && <div className={styles.divider} />}
                            <h3 className={styles.languageName}>{lang.language}</h3>
                            <p className={styles.proficiency}>{lang.proficiency}</p>
                        </div>
                    ))}
                    {languages.length === 0 && (
                        <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '16px' }}>
                            No languages added yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Add Language Modal */}
            <ProfileModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add language"
                onSave={handleSaveNew}
            >
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Language*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.language}
                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                        placeholder="Ex: French"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Proficiency</label>
                    <select
                        className={modalStyles.input}
                        value={formData.proficiency}
                        onChange={e => setFormData({ ...formData, proficiency: e.target.value })}
                    >
                        {proficiencyOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            </ProfileModal>

            {/* Edit Language Modal */}
            <ProfileModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingIndex(null); }}
                title="Edit language"
                onSave={handleSaveEdit}
            >
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Language*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.language}
                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                        placeholder="Ex: French"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Proficiency</label>
                    <select
                        className={modalStyles.input}
                        value={formData.proficiency}
                        onChange={e => setFormData({ ...formData, proficiency: e.target.value })}
                    >
                        {proficiencyOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginTop: '16px' }}>
                    <Button
                        appearance="subtle"
                        onClick={handleDelete}
                        style={{ color: '#d32f2f' }}
                    >
                        Delete language
                    </Button>
                </div>
            </ProfileModal>
        </>
    )
}
