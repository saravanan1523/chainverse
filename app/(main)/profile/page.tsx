'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'
import { AboutSection } from '@/components/profile/AboutSection'
import { ExperienceSection } from '@/components/profile/ExperienceSection'
import { EducationSection } from '@/components/profile/EducationSection'
import { SkillsSection } from '@/components/profile/SkillsSection'
import { CertificationsSection } from '@/components/profile/CertificationsSection'
import { LanguagesSection } from '@/components/profile/LanguagesSection'
import styles from './profile.module.css'

export default function ProfilePage() {
    const { data: session, status } = useSession()

    if (status === 'unauthenticated') {
        redirect('/login')
    }

    if (status === 'loading') {
        return <div className={styles.loading}>Loading profile...</div>
    }

    return (
        <div className={styles.profileContainer}>
            {/* Main Content */}
            <div className={styles.mainContent}>
                <ProfileHeader />
                <ProfileDashboard />
                <AboutSection />
                <ExperienceSection />
                <EducationSection />
                <SkillsSection />
                <CertificationsSection />
                <LanguagesSection />
            </div>

            {/* Right Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                    <h3 className={styles.sidebarTitle}>Profile Language</h3>
                    <p className={styles.sidebarText}>English</p>
                </div>

                <div className={styles.sidebarCard}>
                    <h3 className={styles.sidebarTitle}>Public profile & URL</h3>
                    <p className={styles.sidebarText}>
                        chainverse.com/in/testuser
                    </p>
                </div>
            </aside>
        </div>
    )
}
