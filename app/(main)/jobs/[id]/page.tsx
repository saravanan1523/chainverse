'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@fluentui/react-components'
import {
    Building24Regular,
    Location24Regular,
    Briefcase24Regular,
    Money24Regular,
    Share24Regular,
    Bookmark24Regular
} from '@fluentui/react-icons'
import { formatDistanceToNow } from 'date-fns'
import styles from '../jobDetail.module.css'

export default function JobDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [job, setJob] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchJob = async () => {
            try {
                // Since we don't have a specific ID endpoint yet, we can reuse the list endpoint with a filter 
                // OR ideally create GET /api/jobs/[id]. For now, let's assume we can fetch all or search by ID if implemented
                // Actually, the best way for a detail page is a dedicated endpoint. 
                // Let's implement that next. For now, we will create the page structure.
                const res = await fetch(`/api/jobs/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setJob(data)
                }
            } catch (error) {
                console.error('Failed to fetch job:', error)
            } finally {
                setIsLoading(false)
            }
        }
        if (id) fetchJob()
    }, [id])

    const isJobLoaded = !isLoading && job

    if (isLoading) return <div className={styles.loading}>Loading job details...</div>
    if (!job) return <div className={styles.loading}>Job not found</div>

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{job.title}</h1>
                    <div className={styles.meta}>
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location} ({job.locationType})</span>
                        <span>•</span>
                        <span className={styles.postedDate}>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                    </div>

                    <div className={styles.actionButtons}>
                        <Button appearance="primary" size="large">Apply Now</Button>
                        <Button appearance="outline" size="large" icon={<Bookmark24Regular />}>Save</Button>
                        <Button appearance="subtle" icon={<Share24Regular />}>Share</Button>
                    </div>
                </div>

                <div className={styles.content}>
                    <h2 className={styles.sectionTitle}>About the job</h2>
                    <div className={styles.description}>
                        {job.description}
                    </div>

                    <h2 className={`${styles.sectionTitle} ${styles.skillsMargin}`}>Skills</h2>
                    <div className={styles.skillsContainer}>
                        {job.tags && job.tags.map((tag: string) => (
                            <span key={tag} className={styles.skillTag}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </main>

            <aside>
                <div className={styles.sidebarCard}>
                    <h3 className={styles.sidebarTitle}>Quick Details</h3>
                    <div className={styles.quickDetails}>
                        <div className={styles.detailRow}>
                            <Building24Regular />
                            <div>
                                <div className={styles.detailLabel}>Company</div>
                                <div className={styles.detailValue}>{job.company}</div>
                            </div>
                        </div>
                        <div className={styles.detailRow}>
                            <Briefcase24Regular />
                            <div>
                                <div className={styles.detailLabel}>Job Type</div>
                                <div className={styles.detailValue}>{job.jobType}</div>
                            </div>
                        </div>
                        {job.salaryMin && (
                            <div className={styles.detailRow}>
                                <Money24Regular />
                                <div>
                                    <div className={styles.detailLabel}>Salary</div>
                                    <div className={styles.detailValue}>${job.salaryMin.toLocaleString()} - {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : '+'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    )
}
