'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
    Person24Regular,
    ArrowRotateCounterclockwise24Regular,
    CheckmarkCircle24Regular,
    DismissCircle24Regular,
    Note24Regular,
    Document24Regular
} from '@fluentui/react-icons'
import styles from './recruiterDashboard.module.css'

export default function RecruiterDashboard() {
    const [applications, setApplications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('ALL')

    const fetchApplications = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/applications?type=received')
            if (res.ok) {
                const data = await res.json()
                setApplications(data)
            }
        } catch (error) {
            console.error('Failed to fetch received applications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateStatus = async (appId: string, status: string) => {
        try {
            const res = await fetch(`/api/applications/${appId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                fetchApplications() // Refresh list
            }
        } catch (error) {
            console.error('Failed to update application status:', error)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [])

    const filteredApps = filterStatus === 'ALL'
        ? applications
        : applications.filter(app => app.status === filterStatus)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Recruiter Dashboard</h1>
                    <p className={styles.subtitle}>Manage candidates and job openings</p>
                </div>
                <div className={styles.filters}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.select}
                    >
                        <option value="ALL">All Applications</option>
                        <option value="APPLIED">Applied</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="INTERVIEWING">Interviewing</option>
                        <option value="OFFERED">Offered</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading applications...</div>
            ) : filteredApps.length > 0 ? (
                <div className={styles.grid}>
                    {filteredApps.map((app) => (
                        <Card key={app.id} className={styles.candidateCard}>
                            <div className={styles.candidatePrimary}>
                                <div className={styles.avatar}>
                                    {app.user.image ? (
                                        <img src={app.user.image} alt={app.user.name} />
                                    ) : (
                                        <Person24Regular />
                                    )}
                                </div>
                                <div className={styles.candidateInfo}>
                                    <h3 className={styles.candidateName}>{app.user.name}</h3>
                                    <p className={styles.candidateBio}>{app.user.bio}</p>
                                    <div className={styles.appliedFor}>
                                        Applied for <span className={styles.jobText}>{app.job.title}</span>
                                    </div>
                                </div>
                                <div className={styles.statusBadge}>
                                    <Badge type="status" status={app.status}>
                                        {app.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className={styles.candidateActions}>
                                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                                    <Document24Regular /> View Resume
                                </a>
                                <button onClick={() => updateStatus(app.id, 'REVIEWING')} className={styles.actionButton}>
                                    <ArrowRotateCounterclockwise24Regular /> Mark Reviewing
                                </button>
                                <button onClick={() => updateStatus(app.id, 'INTERVIEWING')} className={styles.actionButton}>
                                    <Note24Regular /> Schedule Interview
                                </button>
                                <div className={styles.decisionGroup}>
                                    <button
                                        onClick={() => updateStatus(app.id, 'OFFERED')}
                                        className={`${styles.decisionButton} ${styles.offer}`}
                                    >
                                        <CheckmarkCircle24Regular /> Offer
                                    </button>
                                    <button
                                        onClick={() => updateStatus(app.id, 'REJECTED')}
                                        className={`${styles.decisionButton} ${styles.reject}`}
                                    >
                                        <DismissCircle24Regular /> Reject
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <Person24Regular className={styles.emptyIcon} />
                    <h3>No candidates found</h3>
                    <p>When someone applies for your jobs, you'll see them here.</p>
                </div>
            )}
        </div>
    )
}
