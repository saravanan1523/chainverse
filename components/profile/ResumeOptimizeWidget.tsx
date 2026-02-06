'use client'

import { useState, useEffect } from 'react'
import {
    Sparkle24Filled,
    ArrowRotateCounterclockwise24Regular,
    CheckmarkCircle24Regular,
    Warning24Regular
} from '@fluentui/react-icons'
import styles from './resumeOptimizeWidget.module.css'

interface ResumeOptimizeWidgetProps {
    userId: string
}

export function ResumeOptimizeWidget({ userId }: ResumeOptimizeWidgetProps) {
    const [analysis, setAnalysis] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalysis = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'RESUME_ANALYSIS',
                    payload: {}
                })
            })

            if (res.ok) {
                const data = await res.json()
                setAnalysis(data)
            } else {
                setError('Failed to analyze profile')
            }
        } catch (err) {
            setError('An error occurred during analysis')
        } finally {
            setIsLoading(false)
        }
    }

    if (!analysis && !isLoading && !error) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <Sparkle24Filled className={styles.sparkleIcon} />
                    <div className={styles.emptyContent}>
                        <h4 className={styles.title}>AI Profile Optimizer</h4>
                        <p className={styles.description}>Get professional feedback on your profile and industry-specific skill suggestions.</p>
                        <button onClick={fetchAnalysis} className={styles.analyzeButton}>
                            Analyze Profile
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleWrapper}>
                    <Sparkle24Filled className={styles.sparkleIcon} />
                    <h4 className={styles.title}>Career Insights</h4>
                </div>
                <button onClick={fetchAnalysis} className={styles.refreshButton} disabled={isLoading}>
                    <ArrowRotateCounterclockwise24Regular />
                </button>
            </div>

            {isLoading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Analyzing your profile...</span>
                </div>
            ) : error ? (
                <div className={styles.error}>
                    <Warning24Regular />
                    <span>{error}</span>
                </div>
            ) : analysis && (
                <div className={styles.analysisContent}>
                    <div className={styles.scoreSection}>
                        <div className={styles.scoreCircle}>
                            <span className={styles.scoreValue}>{analysis.score}</span>
                            <span className={styles.scoreLabel}>Score</span>
                        </div>
                        <p className={styles.feedback}>{analysis.feedback}</p>
                    </div>

                    <div className={styles.section}>
                        <h5 className={styles.sectionTitle}>Actionable Suggestions</h5>
                        <ul className={styles.list}>
                            {analysis.suggestions?.map((item: string, idx: number) => (
                                <li key={idx} className={styles.listItem}>
                                    <CheckmarkCircle24Regular className={styles.checkIcon} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h5 className={styles.sectionTitle}>Missing Skills</h5>
                        <div className={styles.skillsGrid}>
                            {analysis.missingSkills?.map((skill: string, idx: number) => (
                                <span key={idx} className={styles.skillBadge}>{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
