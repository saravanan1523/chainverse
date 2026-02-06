'use client'

import { useState, useEffect } from 'react'
import { Edit24Regular, Add24Regular } from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { ProfileModal } from './ProfileModal'
import styles from './certificationsSection.module.css'
import modalStyles from './profileModal.module.css'
import type { Certification } from '@prisma/client'

interface SkillsSectionProps {
    userId?: string
}

export function CertificationsSection({ userId }: SkillsSectionProps) {
    const [certifications, setCertifications] = useState<Certification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingCert, setEditingCert] = useState<Certification | null>(null)
    const [formData, setFormData] = useState<Partial<Certification>>({})

    const fetchCertifications = async () => {
        if (!userId) return
        try {
            const res = await fetch(`/api/profile/certifications?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setCertifications(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCertifications()
    }, [userId])

    const handleAdd = () => {
        setFormData({ name: '', organization: '', issueDate: '', credentialId: '' })
        setIsAddModalOpen(true)
    }

    const handleEdit = (cert: Certification) => {
        setEditingCert(cert)
        setFormData(cert)
        setIsEditModalOpen(true)
    }

    const handleSaveNew = async () => {
        if (!formData.name?.trim() || !formData.organization?.trim()) return
        try {
            const res = await fetch('/api/profile/certifications', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                fetchCertifications()
                setIsAddModalOpen(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleSaveEdit = async () => {
        if (!editingCert || !formData.name?.trim()) return
        try {
            const res = await fetch('/api/profile/certifications', {
                method: 'PATCH',
                body: JSON.stringify({ ...formData, id: editingCert.id }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                fetchCertifications()
                setIsEditModalOpen(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async () => {
        if (!editingCert) return
        try {
            const res = await fetch(`/api/profile/certifications?id=${editingCert.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchCertifications()
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
                    <h2 className={styles.title}>Licenses & Certifications</h2>
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
                            onClick={() => certifications.length > 0 && handleEdit(certifications[0])}
                        />
                    </div>
                </div>

                <div className={styles.certifications}>
                    {certifications.map((cert, index) => (
                        <div
                            key={cert.id}
                            className={styles.certification}
                            onClick={() => handleEdit(cert)}
                            style={{ cursor: 'pointer' }}
                        >
                            {index > 0 && <div className={styles.divider} />}

                            <div className={styles.orgLogo}>
                                <div className={styles.logoPlaceholder}>
                                    {cert.organization.charAt(0)}
                                </div>
                            </div>

                            <div className={styles.details}>
                                <h3 className={styles.certName}>{cert.name}</h3>
                                <p className={styles.organization}>{cert.organization}</p>
                                <p className={styles.issueDate}>Issued {cert.issueDate}</p>
                                {cert.credentialId && (
                                    <p className={styles.credentialId}>
                                        Credential ID: {cert.credentialId}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    {certifications.length === 0 && (
                        <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '16px' }}>
                            No certifications added yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Add Certification Modal */}
            <ProfileModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add license or certification"
                onSave={handleSaveNew}
            >
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Name*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: CSCP - Certified Supply Chain Professional"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Issuing organization*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.organization || ''}
                        onChange={e => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Ex: ASCM"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Issue date</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.issueDate || ''}
                        onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                        placeholder="Ex: Jun 2023"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Credential ID</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.credentialId || ''}
                        onChange={e => setFormData({ ...formData, credentialId: e.target.value })}
                        placeholder="Ex: ABC123XYZ"
                    />
                </div>
            </ProfileModal>

            {/* Edit Certification Modal */}
            <ProfileModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingCert(null); }}
                title="Edit license or certification"
                onSave={handleSaveEdit}
            >
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Name*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: CSCP - Certified Supply Chain Professional"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Issuing organization*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.organization || ''}
                        onChange={e => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Ex: ASCM"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Issue date</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.issueDate || ''}
                        onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                        placeholder="Ex: Jun 2023"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Credential ID</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={formData.credentialId || ''}
                        onChange={e => setFormData({ ...formData, credentialId: e.target.value })}
                        placeholder="Ex: ABC123XYZ"
                    />
                </div>
                <div style={{ marginTop: '16px' }}>
                    <Button
                        appearance="subtle"
                        onClick={handleDelete}
                        style={{ color: '#d32f2f' }}
                    >
                        Delete certification
                    </Button>
                </div>
            </ProfileModal>
        </>
    )
}
