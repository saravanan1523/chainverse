'use client'

import { Badge as FluentBadge, Tooltip } from '@fluentui/react-components'
import {
    Sparkle24Filled,
    Star24Filled,
    People24Filled,
    Certificate24Filled
} from '@fluentui/react-icons'
import styles from './badgeShowcase.module.css'

interface BadgeShowcaseProps {
    badges: any[]
}

const iconMap: Record<string, any> = {
    Sparkle24Filled: Sparkle24Filled,
    Star24Filled: Star24Filled,
    People24Filled: People24Filled,
    Certificate24Filled: Certificate24Filled
}

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
    if (!badges || badges.length === 0) return null

    return (
        <div className={styles.container}>
            <h4 className={styles.sectionTitle}>Achievements</h4>
            <div className={styles.grid}>
                {badges.map((ub) => {
                    const Icon = iconMap[ub.badge.icon] || Certificate24Filled
                    return (
                        <Tooltip key={ub.id} content={`${ub.badge.name}: ${ub.badge.description}`} relationship="label">
                            <div className={styles.badgeItem}>
                                <div className={`${styles.iconWrapper} ${styles[ub.level?.toLowerCase() || 'bronze']}`}>
                                    <Icon />
                                </div>
                                <span className={styles.badgeName}>{ub.badge.name}</span>
                            </div>
                        </Tooltip>
                    )
                })}
            </div>
        </div>
    )
}
