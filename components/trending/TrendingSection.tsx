'use client'

import { useState } from 'react'
import styles from './trendingSection.module.css'

const trendingNews = [
    { title: 'Q.com adopts new playbook', time: '5h ago', readers: 537 },
    { title: 'PE, VC investments decline', time: '6h ago', readers: 363 },
    { title: 'Hospitals eye insurance shift', time: '4h ago', readers: 188 },
    { title: "LinkedIn India's newest Top Voices", time: '10h ago', readers: 8650 },
    { title: "Elon Musk's SpaceX acquires xAI in merger", time: '3h ago', readers: 135787 },
]

export function TrendingSection() {
    const [showMore, setShowMore] = useState(false)

    const displayedNews = showMore ? trendingNews : trendingNews.slice(0, 3)

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>ChainVerse News</h3>

            <div className={styles.news}>
                {displayedNews.map((item, index) => (
                    <div key={index} className={styles.newsItem}>
                        <div className={styles.dot}>•</div>
                        <div className={styles.newsContent}>
                            <h4 className={styles.newsTitle}>{item.title}</h4>
                            <p className={styles.newsMetadata}>
                                {item.time} · {item.readers.toLocaleString()} readers
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                className={styles.showMore}
                onClick={() => setShowMore(!showMore)}
            >
                Show {showMore ? 'less' : 'more'}
                <span className={styles.arrow}>{showMore ? '▲' : '▼'}</span>
            </button>
        </div>
    )
}
