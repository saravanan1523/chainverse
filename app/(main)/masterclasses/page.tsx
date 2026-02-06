'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
    Play24Filled,
    Clock24Regular,
    Person24Regular,
    Star24Filled
} from '@fluentui/react-icons'
import styles from './masterclasses.module.css'

const CATEGORIES = ['All', 'Warehouse Management', 'Procurement', 'Global Trade', 'Sustainable Logistics', 'AI in Operations']

const MOCK_COURSES = [
    {
        id: '1',
        title: 'Advanced Warehouse Optimization',
        instructor: 'Dr. Robert Chen',
        duration: '4.5 hours',
        rating: 4.8,
        category: 'Warehouse Management',
        thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
        level: 'Advanced'
    },
    {
        id: '2',
        title: 'Sustainable Supply Chain Management',
        instructor: 'Sarah Jenkins',
        duration: '3.2 hours',
        rating: 4.9,
        category: 'Sustainable Logistics',
        thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
        level: 'Intermediate'
    },
    {
        id: '3',
        title: 'Mastering International Trade Compliance',
        instructor: 'Marcus Thorne',
        duration: '6 hours',
        rating: 4.7,
        category: 'Global Trade',
        thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2959213?auto=format&fit=crop&q=80&w=800',
        level: 'Advanced'
    },
    {
        id: '4',
        title: 'AI-Driven Demand Forecasting',
        instructor: 'Emily Zhang',
        duration: '5 hours',
        rating: 4.9,
        category: 'AI in Operations',
        thumbnail: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800',
        level: 'Expert'
    }
]

export default function MasterclassesPage() {
    const [selectedCategory, setSelectedCategory] = useState('All')

    const filteredCourses = selectedCategory === 'All'
        ? MOCK_COURSES
        : MOCK_COURSES.filter(c => c.category === selectedCategory)

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <Badge type="premium">MASTERCLASSES</Badge>
                    <h1 className={styles.heroTitle}>Level Up Your Career with Industry Experts</h1>
                    <p className={styles.heroSubtitle}>Premium video courses tailored for modern supply chain professionals.</p>
                </div>
                <div className={styles.heroImage} />
            </div>

            <div className={styles.filterBar}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`${styles.filterButton} ${selectedCategory === cat ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className={styles.grid}>
                {filteredCourses.map(course => (
                    <Card key={course.id} className={styles.courseCard}>
                        <div
                            className={styles.thumbnail}
                            style={{ backgroundImage: `url(${course.thumbnail})` }}
                        >
                            <div className={styles.playOverlay}>
                                <Play24Filled className={styles.playIcon} />
                            </div>
                            <div className={styles.levelBadge}>
                                {course.level}
                            </div>
                        </div>
                        <div className={styles.courseInfo}>
                            <h3 className={styles.courseTitle}>{course.title}</h3>
                            <div className={styles.instructor}>
                                <Person24Regular /> {course.instructor}
                            </div>
                            <div className={styles.meta}>
                                <div className={styles.metaItem}>
                                    <Clock24Regular /> {course.duration}
                                </div>
                                <div className={styles.metaItem}>
                                    <Star24Filled className={styles.star} /> {course.rating}
                                </div>
                            </div>
                            <button className={styles.enrollButton}>Start Learning</button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
