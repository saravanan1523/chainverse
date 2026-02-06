'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
    Checkmark24Regular,
    Dismiss24Regular,
    Warning24Regular,
    Person24Regular,
    Eye24Regular
} from '@fluentui/react-icons'
import styles from './moderationQueue.module.css'
import { formatDistanceToNow } from 'date-fns'

export function ModerationQueue() {
    const [reports, setReports] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchReports = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/reports')
            if (res.ok) {
                const data = await res.json()
                setReports(data)
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (reportId: string, action: 'RESOLVE' | 'DISMISS') => {
        // Implement report resolution logic
        // For now, optimistic update
        setReports(prev => prev.filter(r => r.id !== reportId))
    }

    useEffect(() => {
        fetchReports()
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Moderation Queue</h2>
                <div className={styles.stats}>
                    <Badge type="status" status="INTERVIEWING" {...{ color: 'important' } as any}>{reports.length} Pending</Badge>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading reports...</div>
            ) : reports.length > 0 ? (
                <div className={styles.list}>
                    {reports.map((report) => (
                        <Card key={report.id} className={styles.reportCard}>
                            <div className={styles.reportHeader}>
                                <div className={styles.urgency}>
                                    {report.status === 'URGENT' ? (
                                        <Badge type="status" status="REJECTED" {...{ color: 'danger', appearance: 'tint' } as any}>URGENT</Badge>
                                    ) : (
                                        <Badge type="status" status="REVIEWING" {...{ color: 'warning', appearance: 'tint' } as any}>PENDING</Badge>
                                    )}
                                </div>
                                <span className={styles.time}>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                            </div>

                            <div className={styles.reportContent}>
                                <div className={styles.reporter}>
                                    <Person24Regular className={styles.icon} />
                                    <span>Reported by <strong>{report.reporter.name}</strong></span>
                                </div>
                                <div className={styles.target}>
                                    <Badge appearance="outline">{report.targetType}</Badge>
                                    <span className={styles.targetId}>ID: {report.targetId}</span>
                                </div>
                                <p className={styles.reason}>{report.reason}</p>
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.viewButton}>
                                    <Eye24Regular /> View Content
                                </button>
                                <div className={styles.decisionGroup}>
                                    <button
                                        className={`${styles.decisionButton} ${styles.resolve}`}
                                        onClick={() => handleAction(report.id, 'RESOLVE')}
                                    >
                                        <Checkmark24Regular /> Take Action
                                    </button>
                                    <button
                                        className={`${styles.decisionButton} ${styles.dismiss}`}
                                        onClick={() => handleAction(report.id, 'DISMISS')}
                                    >
                                        <Dismiss24Regular /> Dismiss
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <Checkmark24Regular className={styles.emptyIcon} />
                    <h3>Queue Clear!</h3>
                    <p>All reports have been processed.</p>
                </div>
            )}
        </div>
    )
}
