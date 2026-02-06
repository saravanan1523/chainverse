'use client'

import { Button } from '@fluentui/react-components'
import { Briefcase24Regular, Location24Regular, Clock24Regular, Sparkle24Filled } from '@fluentui/react-icons'
import styles from './jobCard.module.css'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { InterviewSimulator } from './InterviewSimulator'

interface JobCardProps {
    job: {
        id: string
        title: string
        company: string
        location: string
        locationType: string
        jobType: string
        description?: string
        createdAt: string
        salaryMin?: number
        salaryMax?: number
    }
}

export function JobCard({ job }: JobCardProps) {
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
    const timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.companyLogo}>
                        {job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className={styles.title}>
                            <Link href={`/jobs/${job.id}`} className={styles.link}>
                                {job.title}
                            </Link>
                        </h3>
                        <p className={styles.company}>{job.company}</p>
                    </div>
                </div>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <Location24Regular className={styles.icon} />
                        <span>{job.location} ({job.locationType})</span>
                    </div>
                    <div className={styles.detailItem}>
                        <Briefcase24Regular className={styles.icon} />
                        <span>{job.jobType}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <Clock24Regular className={styles.icon} />
                        <span>{timeAgo}</span>
                    </div>
                </div>

                {job.salaryMin && (
                    <p className={styles.salary}>
                        ${job.salaryMin.toLocaleString()} - {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : '+'}
                    </p>
                )}
            </div>

            <div className={styles.actions}>
                <Button
                    appearance="subtle"
                    icon={<Sparkle24Filled />}
                    className={styles.aiButton}
                    onClick={() => setIsSimulatorOpen(true)}
                >
                    Practice Interview
                </Button>
                <div className={styles.mainActions}>
                    <Button appearance="primary" as="a" href={`/jobs/${job.id}`}>
                        View Details
                    </Button>
                    <Button appearance="subtle">Save</Button>
                </div>
            </div>

            <InterviewSimulator
                isOpen={isSimulatorOpen}
                onClose={() => setIsSimulatorOpen(false)}
                jobTitle={job.title}
                jobDescription={job.description || `${job.title} at ${job.company}`}
            />
        </div>
    )
}
