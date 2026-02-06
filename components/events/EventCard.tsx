'use client'

import { format } from 'date-fns'
import {
    Calendar24Regular,
    Location24Regular,
    Link24Regular
} from '@fluentui/react-icons'
import styles from './eventCard.module.css'

interface Event {
    id: string
    title: string
    description: string
    startTime: string
    isOnline: boolean
    location: string | null
    link: string | null
    organizerId: string
}

export function EventCard({ event }: { event: Event }) {
    const date = new Date(event.startTime)

    return (
        <div className={styles.card}>
            <div className={styles.dateBadge}>
                <span className={styles.month}>{format(date, 'MMM')}</span>
                <span className={styles.day}>{format(date, 'd')}</span>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{event.title}</h3>

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Calendar24Regular />
                        <span>{format(date, 'EEEE, h:mm a')}</span>
                    </div>

                    <div className={styles.metaItem}>
                        {event.isOnline ? (
                            <>
                                <Link24Regular />
                                <span>Online Event</span>
                            </>
                        ) : (
                            <>
                                <Location24Regular />
                                <span>{event.location || 'TBD'}</span>
                            </>
                        )}
                    </div>
                </div>

                <p className={styles.description}>
                    {event.description.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description}
                </p>

                <div className={styles.actions}>
                    <button className={styles.attendButton}>Attend</button>
                    {event.isOnline && event.link && (
                        <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkButton}
                        >
                            Join Link
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
