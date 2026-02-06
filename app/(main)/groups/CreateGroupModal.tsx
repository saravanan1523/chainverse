'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Edit24Regular, Add24Regular, Info24Regular } from '@fluentui/react-icons'
import styles from './createGroupModal.module.css'

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState('')
    const [description, setDescription] = useState('')
    const [industry, setIndustry] = useState('')
    const [location, setLocation] = useState('')
    const [rules, setRules] = useState('')
    const [groupType, setGroupType] = useState('public')
    const [allowInvites, setAllowInvites] = useState(true)
    const [requireReview, setRequireReview] = useState(true)

    const isFormValid = groupName.trim().length > 0 && description.trim().length > 0

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    description,
                    industry,
                    location,
                    rules,
                    type: groupType
                })
            })

            if (res.ok) {
                // Reset form
                setGroupName('')
                setDescription('')
                setIndustry('')
                setLocation('')
                setRules('')
                setGroupType('public')
                onClose()
            } else {
                const error = await res.json()
                console.error("Failed to create group:", error)
                alert(`Failed to create group: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error("Error creating group:", error)
            alert('An error occurred while creating the group')
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create group"
            size="large"
            footer={
                <div className={styles.footer}>
                    <button
                        className={`${styles.createBtn} ${isFormValid ? styles.active : ''}`}
                        disabled={!isFormValid}
                        onClick={handleCreate}
                    >
                        Create
                    </button>
                </div>
            }
        >
            <div className={styles.modalContent}>
                {/* Visual Header */}
                <div className={styles.visualSection}>
                    <button className={styles.editCoverBtn} title="Edit cover photo">
                        <Edit24Regular fontSize={16} />
                    </button>

                    <div className={styles.logoContainer}>
                        <div className={styles.logoPlaceholder} />
                        <button className={styles.editLogoBtn} title="Edit logo">
                            <Edit24Regular fontSize={16} />
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className={styles.formSection}>
                    <div className={styles.requiredNote}>* Indicates required</div>

                    <div className={styles.fieldGroup}>
                        <label className={`${styles.label} ${styles.labelRequired}`}>Group name</label>
                        <input
                            className={styles.input}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            maxLength={100}
                        />
                        <span className={styles.charCount}>{groupName.length}/100</span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={`${styles.label} ${styles.labelRequired}`}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is the purpose of your group?"
                            maxLength={2000}
                        />
                        <span className={styles.charCount}>{description.length}/2,000</span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <h3 className={styles.sectionTitle}>Industry (up to 3)</h3>
                        <button className={styles.addIndustryBtn}>
                            <Add24Regular fontSize={16} />
                            Add industry
                        </button>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Location</label>
                        <input
                            className={styles.input}
                            placeholder="Add a location to your group"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Rules</label>
                        <textarea
                            className={styles.textarea}
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            placeholder="Set the tone and expectations of your group"
                            maxLength={4000}
                        />
                        <span className={styles.charCount}>{rules.length}/4,000</span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label} style={{ marginBottom: 8 }}>Group type</label>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="groupType"
                                    className={styles.radioInput}
                                    checked={groupType === 'public'}
                                    onChange={() => setGroupType('public')}
                                />
                                <div className={styles.radioLabel}>
                                    <span className={styles.radioTitle}>Public</span>
                                    <span className={styles.radioDesc}>
                                        Anyone, on or off ChainVerse can see posts in the group. The group appears in search results and is visible to others on members' profiles.
                                    </span>
                                </div>
                            </label>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="groupType"
                                    className={styles.radioInput}
                                    checked={groupType === 'private'}
                                    onChange={() => setGroupType('private')}
                                />
                                <div className={styles.radioLabel}>
                                    <span className={styles.radioTitle}>Private</span>
                                    <span className={styles.radioDesc}>
                                        Only group members can see posts in the group.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className={styles.infoBox}>
                        <Info24Regular />
                        <span>Group type can't be changed once it's created. <a href="#" className={styles.link}>Learn more</a></span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Discoverability</label>
                        <span className={styles.radioDesc}>
                            {groupType === 'public'
                                ? "Public groups appear in search results and are visible to others on members' profiles."
                                : "Private groups only appear in search if allowed."}
                        </span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.permissions}>
                            <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>Permissions</h3>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxOption}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                        checked={allowInvites}
                                        onChange={(e) => setAllowInvites(e.target.checked)}
                                    />
                                    <div className={styles.checkboxLabel}>
                                        <h4>Allow members to invite their connections</h4>
                                        <p>Group members can invite 1st degree connections to the group. All requests to join will still require admin approval.</p>
                                    </div>
                                </label>

                                <label className={styles.checkboxOption}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                        checked={requireReview}
                                        onChange={(e) => setRequireReview(e.target.checked)}
                                    />
                                    <div className={styles.checkboxLabel}>
                                        <h4>Require new posts to be reviewed by admins</h4>
                                        <p>Members' posts will require admin approval within 14 days before they become visible to others.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Modal>
    )
}
