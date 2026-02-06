'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Add24Regular, Edit24Regular } from '@fluentui/react-icons'
import { EndorsementButton } from './EndorsementButton'
import styles from './skillsSection.module.css'

interface SkillData {
    name: string
    count: number
    isEndorsed: boolean
}

interface SkillsSectionProps {
    userId?: string
    skills?: SkillData[]
    isOwnProfile?: boolean
}

export function SkillsSection({ userId, skills = [], isOwnProfile = false }: SkillsSectionProps) {
    return (
        <Card>
            <div className={styles.header}>
                <h2 className={styles.title}>Skills</h2>
                <div className={styles.headerActions}>
                    {isOwnProfile && (
                        <>
                            <Button appearance="subtle" icon={<Add24Regular />}>
                                Add skill
                            </Button>
                            <Button appearance="subtle" icon={<Edit24Regular />} />
                        </>
                    )}
                </div>
            </div>

            <div className={styles.skills}>
                {skills.length > 0 ? (
                    skills.map((skill) => (
                        <EndorsementButton
                            key={skill.name}
                            userId={userId || ''}
                            skill={skill.name}
                            initialCount={skill.count}
                            initialIsEndorsed={skill.isEndorsed}
                            readonly={isOwnProfile}
                        />
                    ))
                ) : (
                    <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No skills added yet.</p>
                )}
            </div>
        </Card>
    )
}
