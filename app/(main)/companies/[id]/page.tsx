'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Tab, TabList } from '@fluentui/react-components'
import { Location24Regular, People24Regular, Star24Filled } from '@fluentui/react-icons'
import { Avatar } from '@/components/ui/Avatar'
import { JobCard } from '@/components/jobs/JobCard'
import { CompanyFollowButton } from '@/components/companies/CompanyFollowButton'
import styles from './company-profile.module.css'

interface Company {
    id: string
    name: string
    industry?: string
    description?: string
    locations: string[]
    verified: boolean
    _count: {
        employees: number
        jobs: number
        followers?: number
    }
    employees: Array<{
        id: string
        name: string
        role: string
    }>
    jobs: Array<any>
}

export default function CompanyPage() {
    const params = useParams()
    const id = params.id as string
    const [company, setCompany] = useState<Company | null>(null)
    const [selectedTab, setSelectedTab] = useState('home')
    const [isLoading, setIsLoading] = useState(true)
    const [followStatus, setFollowStatus] = useState(false)

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch(`/api/companies/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setCompany(data)
                }
            } catch (error) {
                console.error('Failed to fetch company:', error)
            } finally {
                setIsLoading(false)
            }
        }

        const fetchFollow = async () => {
            try {
                const res = await fetch(`/api/companies/${id}/follow`)
                if (res.ok) {
                    const data = await res.json()
                    setFollowStatus(data.following)
                }
            } catch (error) {
                console.error('Failed to fetch follow:', error)
            }
        }

        if (id) {
            fetchCompany()
            fetchFollow()
        }
    }, [id])

    if (isLoading) return <div className="loading-state">Loading company profile...</div>
    if (!company) return <div className="error-state">Company not found</div>

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                {/* Header Card */}
                <div className={styles.profileHeader}>
                    <div className={styles.coverImage}></div>
                    <div className={styles.headerContent}>
                        <div className={styles.logoWrapper}>
                            <Avatar name={company.name} size={64} isVerified={company.verified} />
                        </div>

                        <div className={styles.infoRow}>
                            <div className={styles.info}>
                                <h1 className={styles.name}>
                                    {company.name}
                                    {company.verified && <Star24Filled className={styles.verifiedIcon} title="Verified" />}
                                </h1>
                                <p className={styles.tagline}>{company.industry}</p>
                                <div className={styles.meta}>
                                    <span className={styles.metaItem}>
                                        <Location24Regular />
                                        {company.locations?.[0] || 'Headquarters'}
                                    </span>
                                    <span className={styles.metaItem}>
                                        <People24Regular />
                                        {company._count?.employees || 0} employees
                                    </span>
                                </div>
                            </div>
                            <CompanyFollowButton
                                companyId={company.id}
                                initialIsFollowing={followStatus}
                                onToggle={setFollowStatus}
                            />
                        </div>
                    </div>

                    <div className={styles.tabBar}>
                        <TabList selectedValue={selectedTab} onTabSelect={(_, data: any) => setSelectedTab(data.value)}>
                            <Tab value="home">Home</Tab>
                            <Tab value="about">About</Tab>
                            <Tab value="jobs">Jobs ({company._count?.jobs || 0})</Tab>
                            <Tab value="people">People</Tab>
                        </TabList>
                    </div>
                </div>

                {/* Tab Content */}
                <div className={styles.contentSection}>
                    {selectedTab === 'home' && (
                        <div>
                            <h2 className={styles.sectionTitle}>Recent Updates</h2>
                            {/* Placeholder for now, would integrate PostFeed with companyId filter */}
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                Company updates coming soon.
                            </div>
                        </div>
                    )}

                    {selectedTab === 'about' && (
                        <div>
                            <h2 className={styles.sectionTitle}>About us</h2>
                            <p className={styles.description}>{company.description || 'No description provided.'}</p>

                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Locations</h3>
                            <div className={styles.locationsGrid}>
                                {company.locations?.length > 0 ? (
                                    company.locations.map((loc: string) => (
                                        <span key={loc} className={styles.locationChip}>{loc}</span>
                                    ))
                                ) : (
                                    <span style={{ color: 'var(--color-text-secondary)' }}>No locations listed.</span>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'jobs' && (
                        <div>
                            <h2 className={styles.sectionTitle}>Open Positions</h2>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {company.jobs?.length > 0 ? (
                                    company.jobs.map((job: any) => (
                                        <JobCard key={job.id} job={{ ...job, company: company.name }} />
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--color-text-secondary)' }}>No open positions at the moment.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'people' && (
                        <div>
                            <h2 className={styles.sectionTitle}>Employees</h2>
                            <div className={styles.employeeGrid}>
                                {company.employees?.length > 0 ? (
                                    company.employees.map((emp: any) => (
                                        <div key={emp.id} className={styles.employeeCard}>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                                                <Avatar name={emp.name} size="medium" />
                                            </div>
                                            <div className={styles.employeeName}>{emp.name}</div>
                                            <div className={styles.employeeRole}>{emp.role || 'Member'}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--color-text-secondary)', gridColumn: '1/-1' }}>No employees listed on the platform yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Sidebar */}
            <aside>
                <div className={styles.sidebarCard}>
                    <h3 className={styles.sectionTitle} style={{ fontSize: '16px' }}>Similar Companies</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Recommendation engine coming soon.</p>
                </div>
            </aside>
        </div>
    )
}
