'use client'

import { useState } from 'react'
import {
    Person24Regular,
    Alert24Regular,
    LockClosed24Regular,
    Save24Regular
} from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import styles from './settings.module.css'

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState('profile')
    const [isSaving, setIsSaving] = useState(false)

    if (status === 'unauthenticated') redirect('/login')
    if (status === 'loading') return null

    const handleSave = () => {
        setIsSaving(true)
        setTimeout(() => setIsSaving(false), 1000)
    }

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Settings</h2>
                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <Person24Regular />
                        Profile
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'notifications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Alert24Regular />
                        Notifications
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <LockClosed24Regular />
                        Security
                    </button>
                </nav>
            </div>

            <div className={styles.content}>
                {activeTab === 'profile' && (
                    <div className={styles.section}>
                        <h2>Public Profile</h2>
                        <p className={styles.description}>Manage how others see you on ChainVerse.</p>

                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input type="text" defaultValue={session?.user?.name || ''} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bio</label>
                            <textarea rows={3} placeholder="Tell us about yourself..." />
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className={styles.section}>
                        <h2>Notifications</h2>
                        <p className={styles.description}>Control what you get notified about.</p>

                        <div className={styles.checkboxGroup}>
                            <label>
                                <input type="checkbox" defaultChecked />
                                Email me about new messages
                            </label>
                            <label>
                                <input type="checkbox" defaultChecked />
                                Email me about connection requests
                            </label>
                            <label>
                                <input type="checkbox" />
                                Email me about job alerts
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className={styles.section}>
                        <h2>Security</h2>
                        <p className={styles.description}>Update your password and account settings.</p>

                        <div className={styles.formGroup}>
                            <label>Current Password</label>
                            <input type="password" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input type="password" />
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <Button
                        appearance="primary"
                        icon={<Save24Regular />}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
