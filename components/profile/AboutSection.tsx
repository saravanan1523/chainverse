'use client'

import { useState } from 'react'
import { Edit24Regular } from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import styles from './aboutSection.module.css'

interface AboutSectionProps {
    about?: string
}

export function AboutSection({ about = "Experienced supply chain professional with 5+ years of expertise in logistics, procurement, and operations management. Passionate about optimizing supply chain processes and implementing innovative solutions to drive efficiency and cost savings." }: AboutSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const shouldTruncate = about.length > 200
    const displayText = isExpanded || !shouldTruncate
        ? about
        : about.slice(0, 200) + '...'

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>About</h2>
                <Button
                    icon={<Edit24Regular />}
                    appearance="subtle"
                    size="small"
                />
            </div>

            <div className={styles.content}>
                <p className={styles.text}>{displayText}</p>
                {shouldTruncate && (
                    <button
                        className={styles.showMore}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        </div>
    )
}
