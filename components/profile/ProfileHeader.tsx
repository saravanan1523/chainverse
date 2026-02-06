'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Edit24Regular,
    MoreHorizontal24Regular,
    Location24Regular,
    Building24Regular,
    Camera24Regular,
    Briefcase24Regular,
    Add24Regular,
    Share24Regular,
    Save24Regular,
    Dismiss24Regular
} from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import styles from './profileHeader.module.css'
import { useMessaging } from '@/context/MessagingContext'
import { ConnectButton } from './ConnectButton'
import { ProfileModal } from './ProfileModal'
import { BadgeShowcase } from './BadgeShowcase'
import modalStyles from './profileModal.module.css'

interface ProfileHeaderProps {
    user?: {
        id?: string
        name?: string | null
        role?: string
        image?: string | null
        coverImage?: string | null
        email?: string | null
        isOpenToWork?: boolean
        badges?: any[]
    }
    isOwnProfile?: boolean
}

export function ProfileHeader({ user, isOwnProfile = true }: ProfileHeaderProps) {
    const { data: session } = useSession()
    const { openPanel } = useMessaging()

    // Modal states
    const [showCoverModal, setShowCoverModal] = useState(false)
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [showOpenToWorkModal, setShowOpenToWorkModal] = useState(false)
    const [showAddSectionModal, setShowAddSectionModal] = useState(false)
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    // Form states
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [openToWorkData, setOpenToWorkData] = useState({
        jobTitle: '',
        employmentType: 'full-time',
        location: '',
        startDate: 'immediately',
        visibility: 'recruiters'
    })

    const coverInputRef = useRef<HTMLInputElement>(null)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    // Use provided user or fallback to session user
    const displayUser = (user || session?.user) as any

    if (!displayUser) return null

    const userInitial = displayUser.name?.charAt(0).toUpperCase() || 'U'
    const profileImage = displayUser.image || avatarPreview
    const headerCoverImage = displayUser.coverImage || coverPreview

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => setCoverPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => setAvatarPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSaveCover = async () => {
        if (!coverPreview) return
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                body: JSON.stringify({ coverImage: coverPreview }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) setShowCoverModal(false)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSaveAvatar = async () => {
        if (!avatarPreview) return
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                body: JSON.stringify({ image: avatarPreview }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) setShowAvatarModal(false)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSaveOpenToWork = async () => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    isOpenToWork: true,
                    openToWorkPreferences: openToWorkData
                }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) setShowOpenToWorkModal(false)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <div className={styles.headerCard}>
                {/* Cover Photo */}
                <div className={styles.cover} style={headerCoverImage ? { backgroundImage: `url(${headerCoverImage})`, backgroundSize: 'cover' } : undefined}>
                    {isOwnProfile && (
                        <Button
                            icon={<Edit24Regular />}
                            className={styles.editCoverButton}
                            appearance="subtle"
                            onClick={() => setShowCoverModal(true)}
                        >
                            Edit cover photo
                        </Button>
                    )}
                </div>

                {/* Profile Avatar */}
                <div className={styles.avatarSection}>
                    <div
                        className={styles.avatar}
                        style={profileImage ? { backgroundImage: `url(${profileImage})`, backgroundSize: 'cover', color: 'transparent' } : undefined}
                    >
                        {!profileImage && userInitial}
                    </div>
                    {isOwnProfile && (
                        <Button
                            icon={<Camera24Regular />}
                            className={styles.editAvatarButton}
                            appearance="subtle"
                            size="small"
                            onClick={() => setShowAvatarModal(true)}
                        />
                    )}
                </div>

                {/* User Information */}
                <div className={styles.userInfo}>
                    <div className={styles.nameSection}>
                        <h1 className={styles.userName}>{displayUser.name}</h1>
                        {isOwnProfile && (
                            <Button
                                icon={<MoreHorizontal24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                            />
                        )}
                    </div>

                    <p className={styles.userTitle}>
                        {displayUser.role || 'Supply Chain Professional'}
                    </p>

                    <div className={styles.metaInfo}>
                        <div className={styles.metaItem}>
                            <Location24Regular className={styles.metaIcon} />
                            <span>San Francisco Bay Area</span>
                        </div>
                        <div className={styles.metaItem}>
                            <Building24Regular className={styles.metaIcon} />
                            <span>Logistics & Supply Chain</span>
                        </div>
                    </div>

                    <p className={styles.connections}>
                        <strong>260</strong> connections
                    </p>

                    <BadgeShowcase badges={displayUser.badges} />
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    {isOwnProfile ? (
                        <>
                            <Button
                                appearance="primary"
                                onClick={() => setShowOpenToWorkModal(true)}
                            >
                                Open to work
                            </Button>
                            <Button
                                appearance="outline"
                                onClick={() => setShowAddSectionModal(true)}
                            >
                                Add profile section
                            </Button>
                            <div style={{ position: 'relative' }}>
                                <Button
                                    appearance="outline"
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                >
                                    More
                                </Button>
                                {showMoreMenu && (
                                    <div className={styles.moreMenu}>
                                        <button className={styles.menuItem} onClick={() => { setShowMoreMenu(false); }}>
                                            <Share24Regular /> Share profile
                                        </button>
                                        <button className={styles.menuItem} onClick={() => { setShowMoreMenu(false); }}>
                                            <Save24Regular /> Save to PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {displayUser.id && <ConnectButton userId={displayUser.id} />}
                            <Button
                                appearance="outline"
                                onClick={() => displayUser?.id && openPanel(displayUser.id)}
                            >
                                Message
                            </Button>
                            <Button appearance="outline">
                                More
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Cover Photo Modal */}
            <ProfileModal
                isOpen={showCoverModal}
                onClose={() => { setShowCoverModal(false); setCoverPreview(null); }}
                title="Edit cover photo"
                onSave={handleSaveCover}
            >
                <div className={modalStyles.formGroup}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                        Upload a cover photo to personalize your profile. Recommended size: 1584 x 396 pixels.
                    </p>
                    <input
                        type="file"
                        ref={coverInputRef}
                        accept="image/*"
                        onChange={handleCoverUpload}
                        style={{ display: 'none' }}
                    />
                    {coverPreview ? (
                        <div style={{ marginBottom: '16px' }}>
                            <img
                                src={coverPreview}
                                alt="Cover preview"
                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>
                    ) : null}
                    <Button
                        appearance="primary"
                        onClick={() => coverInputRef.current?.click()}
                        style={{ width: '100%' }}
                    >
                        <Camera24Regular /> Upload Photo
                    </Button>
                </div>
            </ProfileModal>

            {/* Avatar Photo Modal */}
            <ProfileModal
                isOpen={showAvatarModal}
                onClose={() => { setShowAvatarModal(false); setAvatarPreview(null); }}
                title="Edit profile photo"
                onSave={handleSaveAvatar}
            >
                <div className={modalStyles.formGroup}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                        Upload a profile photo. A clear headshot works best.
                    </p>
                    <input
                        type="file"
                        ref={avatarInputRef}
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                    />
                    {avatarPreview ? (
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        </div>
                    ) : null}
                    <Button
                        appearance="primary"
                        onClick={() => avatarInputRef.current?.click()}
                        style={{ width: '100%' }}
                    >
                        <Camera24Regular /> Upload Photo
                    </Button>
                </div>
            </ProfileModal>

            {/* Open to Work Modal */}
            <ProfileModal
                isOpen={showOpenToWorkModal}
                onClose={() => setShowOpenToWorkModal(false)}
                title="Open to work"
                onSave={handleSaveOpenToWork}
            >
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Job title*</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={openToWorkData.jobTitle}
                        onChange={e => setOpenToWorkData({ ...openToWorkData, jobTitle: e.target.value })}
                        placeholder="Ex: Supply Chain Manager"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Employment type</label>
                    <select
                        className={modalStyles.input}
                        value={openToWorkData.employmentType}
                        onChange={e => setOpenToWorkData({ ...openToWorkData, employmentType: e.target.value })}
                    >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                    </select>
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Location (on-site/remote)</label>
                    <input
                        type="text"
                        className={modalStyles.input}
                        value={openToWorkData.location}
                        onChange={e => setOpenToWorkData({ ...openToWorkData, location: e.target.value })}
                        placeholder="Ex: San Francisco Bay Area (Remote)"
                    />
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Start date</label>
                    <select
                        className={modalStyles.input}
                        value={openToWorkData.startDate}
                        onChange={e => setOpenToWorkData({ ...openToWorkData, startDate: e.target.value })}
                    >
                        <option value="immediately">Immediately</option>
                        <option value="2-weeks">In 2 weeks</option>
                        <option value="1-month">In 1 month</option>
                        <option value="flexible">Flexible</option>
                    </select>
                </div>
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Who can see you're open</label>
                    <select
                        className={modalStyles.input}
                        value={openToWorkData.visibility}
                        onChange={e => setOpenToWorkData({ ...openToWorkData, visibility: e.target.value })}
                    >
                        <option value="recruiters">Recruiters only</option>
                        <option value="all">All ChainVerse members</option>
                    </select>
                </div>
            </ProfileModal>

            {/* Add Profile Section Modal */}
            <ProfileModal
                isOpen={showAddSectionModal}
                onClose={() => setShowAddSectionModal(false)}
                title="Add to profile"
                onSave={() => setShowAddSectionModal(false)}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                        Choose a section to add to your profile:
                    </p>
                    <button className={styles.sectionButton}>
                        <Briefcase24Regular /> Add position
                    </button>
                    <button className={styles.sectionButton}>
                        <Add24Regular /> Add education
                    </button>
                    <button className={styles.sectionButton}>
                        <Add24Regular /> Add skill
                    </button>
                    <button className={styles.sectionButton}>
                        <Add24Regular /> Add certification
                    </button>
                    <button className={styles.sectionButton}>
                        <Add24Regular /> Add language
                    </button>
                    <button className={styles.sectionButton}>
                        <Add24Regular /> Add project
                    </button>
                </div>
            </ProfileModal>
        </>
    )
}
