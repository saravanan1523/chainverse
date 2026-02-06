'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Add16Regular, Checkmark16Regular } from '@fluentui/react-icons'
import styles from './EndorsementButton.module.css'

interface EndorsementButtonProps {
    userId: string
    skill: string
    initialCount: number
    initialIsEndorsed: boolean
    readonly?: boolean
}

export function EndorsementButton({
    userId,
    skill,
    initialCount,
    initialIsEndorsed,
    readonly = false
}: EndorsementButtonProps) {
    const [count, setCount] = useState(initialCount)
    const [isEndorsed, setIsEndorsed] = useState(initialIsEndorsed)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        if (readonly || isLoading) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/users/${userId}/endorse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill })
            })

            if (res.ok) {
                const data = await res.json()
                setIsEndorsed(data.endorsed)
                setCount(prev => data.endorsed ? prev + 1 : prev - 1)
            }
        } catch (error) {
            console.error('Failed to toggle endorsement', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (readonly) {
        return (
            <div className={styles.readonlyBadge}>
                <span className={styles.skillName}>{skill}</span>
                {count > 0 && <span className={styles.count}>{count}</span>}
            </div>
        )
    }

    return (
        <button
            className={`${styles.button} ${isEndorsed ? styles.endorsed : ''}`}
            onClick={handleToggle}
            disabled={isLoading}
            title={isEndorsed ? 'Remove endorsement' : 'Endorse this skill'}
        >
            <span className={styles.skillName}>{skill}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.count}>{count}</span>
            {isEndorsed ? <Checkmark16Regular className={styles.icon} /> : <Add16Regular className={styles.icon} />}
        </button>
    )
}
