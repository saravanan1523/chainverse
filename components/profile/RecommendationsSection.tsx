'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Edit16Regular } from '@fluentui/react-icons'
import styles from './RecommendationsSection.module.css'
import Link from 'next/link'

interface Recommendation {
    id: string
    content: string
    relation: string
    createdAt: string | Date
    author: {
        id: string
        name: string
        image?: string | null
    }
}

interface RecommendationsSectionProps {
    recommendations: Recommendation[]
    userId: string
    isOwnProfile: boolean
}

export function RecommendationsSection({ recommendations = [], userId, isOwnProfile }: RecommendationsSectionProps) {
    const [isWriting, setIsWriting] = useState(false)

    return (
        <Card>
            <div className={styles.header}>
                <h2 className={styles.title}>Recommendations</h2>
                {!isOwnProfile && (
                    // Placeholder for write modal trigger
                    <Button appearance="secondary" onClick={() => setIsWriting(!isWriting)}>
                        Write a recommendation
                    </Button>
                )}
            </div>

            {isWriting && !isOwnProfile && (
                <div className={styles.writeForm}>
                    <p className={styles.infoText}>
                        Writing a recommendation for this user. Feature coming soon.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <Button onClick={() => setIsWriting(false)}>Cancel</Button>
                        <Button appearance="primary" disabled>Submit</Button>
                    </div>
                </div>
            )}

            <div className={styles.list}>
                {recommendations.length > 0 ? (
                    recommendations.map((rec) => (
                        <div key={rec.id} className={styles.item}>
                            <div className={styles.avatarWrapper}>
                                <Avatar name={rec.author.name} size={48} />
                            </div>
                            <div className={styles.content}>
                                <div className={styles.authorRow}>
                                    <Link href={`/profile/${rec.author.id}`} className={styles.authorName}>
                                        {rec.author.name}
                                    </Link>
                                    <span className={styles.relation}>• {rec.relation}</span>
                                </div>
                                <p className={styles.text}>{rec.content}</p>
                                <span className={styles.date}>
                                    {new Date(rec.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.empty}>No recommendations yet.</p>
                )}
            </div>
        </Card>
    )
}
