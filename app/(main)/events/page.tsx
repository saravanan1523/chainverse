'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
    Calendar24Regular,
    Add24Regular,
    List24Regular
} from '@fluentui/react-icons'
import { Button, Tab, TabList } from '@fluentui/react-components'
import { useState, useEffect } from 'react'
import { EventCard } from '@/components/events/EventCard'
import { EventCalendar } from '@/components/events/EventCalendar'
import { CreateEventModal } from '@/components/events/CreateEventModal'
import styles from './events.module.css'

export default function EventsPage() {
    const { data: session, status } = useSession()
    const [events, setEvents] = useState<any[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [view, setView] = useState<'list' | 'calendar'>('list')

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events')
            const data = await res.json()
            if (Array.isArray(data)) {
                setEvents(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const savedView = localStorage.getItem('events-view') as 'list' | 'calendar'
        if (savedView) setView(savedView)

        if (status === 'authenticated') {
            fetchEvents()
        }
    }, [status])

    const handleViewChange = (v: 'list' | 'calendar') => {
        setView(v)
        localStorage.setItem('events-view', v)
    }

    if (status === 'unauthenticated') {
        redirect('/login')
    }

    if (status === 'loading') {
        return <div style={{ padding: 'var(--space-md)', color: 'var(--color-text-tertiary)' }}>Loading...</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <Calendar24Regular className={styles.icon} />
                    <h1 className={styles.title}>Events</h1>
                </div>
                <div className={styles.headerActions}>
                    <TabList
                        selectedValue={view}
                        onTabSelect={(_, data) => handleViewChange(data.value as any)}
                        className={styles.viewToggle}
                    >
                        <Tab value="list" icon={<List24Regular />}>List</Tab>
                        <Tab value="calendar" icon={<Calendar24Regular />}>Calendar</Tab>
                    </TabList>
                    <Button
                        appearance="primary"
                        icon={<Add24Regular />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create Event
                    </Button>
                </div>
            </div>

            <div className={styles.content}>
                {isLoading ? (
                    <div className={styles.loading}>Loading events...</div>
                ) : events.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Calendar24Regular className={styles.emptyIcon} />
                        <h2>No upcoming events</h2>
                        <p>Be the first to host a meetup or webinar!</p>
                        <Button
                            appearance="secondary"
                            onClick={() => setIsModalOpen(true)}
                            style={{ marginTop: 'var(--space-md)' }}
                        >
                            Host an event
                        </Button>
                    </div>
                ) : (
                    <>
                        {view === 'list' ? (
                            <div className={styles.grid}>
                                {events.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <EventCalendar events={events} />
                        )}
                    </>
                )}
            </div>

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEventCreated={fetchEvents}
            />
        </div>
    )
}
