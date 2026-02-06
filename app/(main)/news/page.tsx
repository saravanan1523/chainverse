'use client'

import { News24Regular, Share24Regular } from '@fluentui/react-icons'
import styles from './news.module.css'

const MOCK_NEWS = [
    {
        id: 1,
        source: 'Supply Chain Dive',
        title: 'Global shipping rates stabilize as new capacity enters market',
        snippet: 'Container freight rates have begun to level off after months of volatility, driven by an influx of new vessel deliveries...',
        image: 'https://images.unsplash.com/photo-1494412574643-35d563db69ce?auto=format&fit=crop&q=80&w=800',
        date: '2h ago',
        category: 'Logistics'
    },
    {
        id: 2,
        source: 'TechCrunch',
        title: 'AI in Warehousing: The next frontier of automation',
        snippet: 'Leading logistics firms are adopting generative AI to optimize inventory placement and predict demand spikes with unprecedented accuracy.',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
        date: '5h ago',
        category: 'Technology'
    },
    {
        id: 3,
        source: 'Reuters',
        title: 'Sustainable Sourcing: Major retailers pledge net-zero by 2040',
        snippet: 'Evaluation of scope 3 emissions becomes critical as top tier retailers demand transparency from their upstream suppliers.',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?auto=format&fit=crop&q=80&w=800',
        date: '1d ago',
        category: 'Sustainability'
    },
    {
        id: 4,
        source: 'FreightWaves',
        title: 'Last-mile delivery innovations reshaping urban logistics',
        snippet: 'From electric bikes to drone pilots, cities are seeing a transformation in how goods reach the final customer.',
        image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800',
        date: '1d ago',
        category: 'Last Mile'
    }
]

export default function NewsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <News24Regular className={styles.icon} />
                <h1 className={styles.title}>Industry News</h1>
                <p className={styles.subtitle}>Curated updates for supply chain professionals.</p>
            </div>

            <div className={styles.feed}>
                {MOCK_NEWS.map(news => (
                    <article key={news.id} className={styles.article}>
                        <div className={styles.imageContainer}>
                            {/* In real app use Next Image, for dev using regular img for external urls */}
                            <img src={news.image} alt={news.title} className={styles.image} />
                            <span className={styles.category}>{news.category}</span>
                        </div>
                        <div className={styles.content}>
                            <div className={styles.meta}>
                                <span className={styles.source}>{news.source}</span>
                                <span className={styles.dot}>•</span>
                                <span className={styles.date}>{news.date}</span>
                            </div>
                            <h2 className={styles.headline}>{news.title}</h2>
                            <p className={styles.snippet}>{news.snippet}</p>
                            <div className={styles.actions}>
                                <button className={styles.actionBtn}>
                                    Read more
                                </button>
                                <button className={styles.iconBtn} title="Share">
                                    <Share24Regular />
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}
