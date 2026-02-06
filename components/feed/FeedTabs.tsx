'use client'

import { TabList, Tab } from '@fluentui/react-components'
import { useState } from 'react'
import styles from './FeedTabs.module.css'

type FeedType = 'ops' | 'people' | 'company'

interface FeedTabsProps {
    activeTab: FeedType
    onTabChange: (tab: FeedType) => void
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
    return (
        <div className={styles.feedTabs}>
            <TabList
                selectedValue={activeTab}
                onTabSelect={(_, data) => onTabChange(data.value as FeedType)}
                size="large"
            >
                <Tab value="ops">
                    <span className={styles.tabLabel}>
                        <span className={styles.tabIcon}>📊</span>
                        Ops Feed
                    </span>
                </Tab>
                <Tab value="people">
                    <span className={styles.tabLabel}>
                        <span className={styles.tabIcon}>👥</span>
                        People Feed
                    </span>
                </Tab>
                <Tab value="company">
                    <span className={styles.tabLabel}>
                        <span className={styles.tabIcon}>🏢</span>
                        Company Feed
                    </span>
                </Tab>
            </TabList>

            <div className={styles.description}>
                {activeTab === 'ops' && (
                    <p>Operational knowledge: Case studies, SOPs, insights, and incidents</p>
                )}
                {activeTab === 'people' && (
                    <p>Professional celebrations, career updates, and achievements</p>
                )}
                {activeTab === 'company' && <p>Company updates, milestones, and announcements</p>}
            </div>
        </div>
    )
}
