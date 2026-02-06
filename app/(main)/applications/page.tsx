'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
    Briefcase24Regular,
    Location24Regular,
    Calendar24Regular,
    Document24Regular
} from '@fluentui/react-icons'
import styles from './applications.module.css'
import { formatDistanceToNow } from 'date-fns'

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchApplications = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/applications?type=sent')
            if (res.ok) {
                const data = await res.json()
                setApplications(data)
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Job Applications</h1>
                <p className={styles.subtitle}>Track and manage your professional opportunities</p>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading applications...</div>
            ) : applications.length > 0 ? (
                <div className={styles.list}>
                    {applications.map((app) => (
                        <Card key={app.id} className={styles.appCard}>
                            <div className={styles.appContent}>
                                <div className={styles.jobInfo}>
                                    <div className={styles.companyLogo}>
                                        {app.job.company.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className={styles.jobTitle}>{app.job.title}</h3>
                                        <p className={styles.companyName}>{app.job.company}</p>
                                    </div>
                                </div>

                                <div className={styles.meta}>
                                    <div className={styles.metaItem}>
                                        <Location24Regular />
                                        <span>{app.job.location}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <Calendar24Regular />
                                        <span>Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <Document24Regular />
                                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className={styles.resumeLink}>View Resume</a>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.statusSection}>
                                <div className={styles.statusBadgeWrapper}>
                                    <span className={styles.statusLabel}>Current Status</span>
                                    <Badge type={"status" as any} status={app.status}>
                                        {app.status}
                                    </Badge>
                                </div>
                                {app.notes && (
                                    <div className={styles.notes}>
                                        <span className={styles.notesLabel}>Notes from Recruiter:</span>
                                        <p className={styles.notesText}>{app.notes}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <Briefcase24Regular className={styles.emptyIcon} />
                    <h3>No applications yet</h3>
                    <p>When you apply for jobs, they will appear here.</p>
                    <a href="/jobs" className={styles.browseButton}>Browse Jobs</a>
                </div>
            )}
        </div>
    )
}
