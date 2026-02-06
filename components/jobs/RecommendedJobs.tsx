'use client'

import { useEffect, useState } from 'react'
import { JobCard } from './JobCard'
import { Card } from '@/components/ui/Card'
import { Sparkle24Regular } from '@fluentui/react-icons'
import styles from './recommendedJobs.module.css'

interface MatchDetails {
    score: number
    matchedSkills: string[]
    missingSkills: string[]
    totalRequirements: number
}

interface Job {
    id: string
    title: string
    company: string
    location: string
    locationType: string
    jobType: string
    description: string
    requirements: string[]
    tags: string[]
    createdAt: string
    matchScore?: number
    matchDetails?: MatchDetails
}

export function RecommendedJobs() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchRecommended()
    }, [])

    const fetchRecommended = async () => {
        try {
            const res = await fetch('/api/jobs/recommended')
            if (res.ok) {
                const data = await res.json()
                setJobs(data)
            }
        } catch (error) {
            console.error('Failed to fetch recommended jobs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <Card className={styles.container}>
                <div className={styles.header}>
                    <Sparkle24Regular className={styles.icon} />
                    <h2 className={styles.title}>Recommended for You</h2>
                </div>
                <p className={styles.loading}>Loading recommendations...</p>
            </Card>
        )
    }

    if (jobs.length === 0) {
        return (
            <Card className={styles.container}>
                <div className={styles.header}>
                    <Sparkle24Regular className={styles.icon} />
                    <h2 className={styles.title}>Recommended for You</h2>
                </div>
                <p className={styles.empty}>
                    Add skills to your profile to get personalized job recommendations.
                </p>
            </Card>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Sparkle24Regular className={styles.icon} />
                <h2 className={styles.title}>Recommended for You</h2>
                <span className={styles.badge}>{jobs.length} matches</span>
            </div>

            <div className={styles.jobsList}>
                {jobs.map(job => (
                    <div key={job.id} className={styles.jobItem}>
                        <JobCard job={job} />
                        {job.matchDetails && job.matchScore && job.matchScore > 0 && (
                            <div className={styles.matchInfo}>
                                <div className={styles.matchScore}>
                                    <span className={styles.scoreLabel}>Match:</span>
                                    <span className={styles.scoreValue}>{job.matchScore}%</span>
                                </div>
                                {job.matchDetails.matchedSkills.length > 0 && (
                                    <div className={styles.skills}>
                                        <span className={styles.skillLabel}>Your skills:</span>
                                        <div className={styles.skillTags}>
                                            {job.matchDetails.matchedSkills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className={styles.skillTag}>{skill}</span>
                                            ))}
                                            {job.matchDetails.matchedSkills.length > 3 && (
                                                <span className={styles.skillTag}>+{job.matchDetails.matchedSkills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {job.matchDetails.missingSkills.length > 0 && (
                                    <div className={styles.skills}>
                                        <span className={styles.skillLabel}>Learn:</span>
                                        <div className={styles.skillTags}>
                                            {job.matchDetails.missingSkills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className={styles.missingSkill}>{skill}</span>
                                            ))}
                                            {job.matchDetails.missingSkills.length > 3 && (
                                                <span className={styles.missingSkill}>+{job.matchDetails.missingSkills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
