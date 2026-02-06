'use client'

import {
    Eye24Regular,
    ChartMultiple24Regular,
    Search24Regular
} from '@fluentui/react-icons'
import styles from './profileDashboard.module.css'

export function ProfileDashboard() {
    return (
        <div className={styles.dashboardCard}>
            <h2 className={styles.title}>Analytics</h2>
            <p className={styles.subtitle}>Private to you</p>

            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <div className={styles.metricHeader}>
                        <Eye24Regular className={styles.metricIcon} />
                        <div>
                            <p className={styles.metricValue}>45</p>
                            <p className={styles.metricLabel}>Profile viewers</p>
                        </div>
                    </div>
                    <p className={styles.metricFooter}>Discover who viewed your profile</p>
                </div>

                <div className={styles.metric}>
                    <div className={styles.metricHeader}>
                        <ChartMultiple24Regular className={styles.metricIcon} />
                        <div>
                            <p className={styles.metricValue}>1,234</p>
                            <p className={styles.metricLabel}>Post impressions</p>
                        </div>
                    </div>
                    <p className={styles.metricFooter}>Check out who's engaging with your posts</p>
                </div>

                <div className={styles.metric}>
                    <div className={styles.metricHeader}>
                        <Search24Regular className={styles.metricIcon} />
                        <div>
                            <p className={styles.metricValue}>12</p>
                            <p className={styles.metricLabel}>Search appearances</p>
                        </div>
                    </div>
                    <p className={styles.metricFooter}>See how often you appear in search results</p>
                </div>
            </div>
        </div>
    )
}
