'use client'

import { useState } from 'react'
import { Card, Button, ProgressBar } from '@fluentui/react-components'
import { CheckmarkCircle24Filled, Circle24Regular } from '@fluentui/react-icons'
import styles from './pollCard.module.css'

interface PollOption {
    id: string
    text: string
    voteCount: number
}

interface PollCardProps {
    poll: {
        id: string
        question: string
        description?: string
        isMultiple: boolean
        isClosed: boolean
        expiresAt?: string
        options: PollOption[]
        userVotes?: string[]
    }
    onVote?: (optionId: string) => void
}

export function PollCard({ poll, onVote }: PollCardProps) {
    const [loadingOptionId, setLoadingOptionId] = useState<string | null>(null)
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0)

    const handleVote = async (optionId: string) => {
        if (poll.isClosed || loadingOptionId) return
        setLoadingOptionId(optionId)
        try {
            await onVote?.(optionId)
        } finally {
            setLoadingOptionId(null)
        }
    }

    const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()
    const canVote = !poll.isClosed && !isExpired

    return (
        <Card className={styles.pollCard}>
            <div className={styles.header}>
                <h3 className={styles.question}>{poll.question}</h3>
                {poll.description && <p className={styles.description}>{poll.description}</p>}
            </div>

            <div className={styles.options}>
                {poll.options.map((option) => {
                    const isVoted = poll.userVotes?.includes(option.id)
                    const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0

                    return (
                        <div key={option.id} className={styles.optionWrapper}>
                            <button
                                className={`
                                    ${styles.optionButton} 
                                    ${isVoted ? styles.voted : ''} 
                                    ${!canVote ? styles.disabled : ''}
                                `}
                                onClick={() => handleVote(option.id)}
                                disabled={!canVote || !!loadingOptionId}
                            >
                                <span className={styles.optionIcon}>
                                    {isVoted ? <CheckmarkCircle24Filled primaryFill="var(--color-primary)" /> : <Circle24Regular />}
                                </span>
                                <span className={styles.optionText}>{option.text}</span>
                                <span className={styles.votePercentage}>{percentage}%</span>
                            </button>
                            <ProgressBar
                                value={percentage / 100}
                                className={styles.progressBar}
                                color={isVoted ? 'brand' : undefined}
                            />
                        </div>
                    )
                })}
            </div>

            <div className={styles.footer}>
                <span className={styles.totalVotes}>{totalVotes} votes</span>
                {poll.expiresAt && (
                    <span className={styles.expiry}>
                        {isExpired ? 'Poll ended' : `Ends ${new Date(poll.expiresAt).toLocaleDateString()}`}
                    </span>
                )}
            </div>
        </Card>
    )
}
