'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Building24Regular, Location16Regular, People16Regular, Star16Filled } from '@fluentui/react-icons'
import styles from './CompanyCard.module.css'

interface CompanyCardProps {
    company: {
        id: string
        name: string
        description?: string | null
        industry?: string | null
        locations?: string[]
        verified: boolean
        _count: {
            employees: number
            posts: number
            followers?: number
        }
    }
}

export function CompanyCard({ company }: CompanyCardProps) {
    return (
        <Card className={styles.card}>
            <div className={styles.header}>
                <div className={styles.logoWrapper}>
                    <Avatar name={company.name} size={48} isVerified={company.verified} />
                </div>
                <div className={styles.info}>
                    <div className={styles.nameRow}>
                        <Link href={`/companies/${company.id}`} className={styles.name}>
                            {company.name}
                        </Link>
                        {company.verified && (
                            <div className={styles.verifiedBadge} title="Verified Company">
                                <Star16Filled />
                            </div>
                        )}
                    </div>
                    {company.industry && (
                        <span className={styles.industry}>
                            <Building24Regular style={{ width: 14, height: 14 }} /> {company.industry}
                        </span>
                    )}
                </div>
            </div>

            <p className={styles.description}>
                {company.description
                    ? (company.description.length > 100 ? `${company.description.substring(0, 100)}...` : company.description)
                    : 'No description available.'}
            </p>

            <div className={styles.stats}>
                <div className={styles.stat} title="Employees">
                    <People16Regular />
                    <span>{company._count.employees} employees</span>
                </div>
                {company.locations && company.locations.length > 0 && (
                    <div className={styles.stat} title="Headquarters">
                        <Location16Regular />
                        <span>{company.locations[0]}</span>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <Link href={`/companies/${company.id}`} style={{ width: '100%' }}>
                    <Button appearance="secondary" style={{ width: '100%' }}>
                        View Profile
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
