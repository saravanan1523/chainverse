'use client'

import { useState } from 'react'
import {
    ChevronLeft24Regular,
    ChevronRight24Regular,
    Calendar24Regular
} from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import styles from './eventCalendar.module.css'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

interface EventCalendarProps {
    events: any[]
    onEventClick?: (event: any) => void
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarHeader}>
                <h2 className={styles.currentMonth}>{format(currentMonth, 'MMMM yyyy')}</h2>
                <div className={styles.controls}>
                    <Button
                        icon={<ChevronLeft24Regular />}
                        appearance="subtle"
                        onClick={prevMonth}
                    />
                    <Button
                        appearance="outline"
                        size="small"
                        onClick={() => setCurrentMonth(new Date())}
                    >
                        Today
                    </Button>
                    <Button
                        icon={<ChevronRight24Regular />}
                        appearance="subtle"
                        onClick={nextMonth}
                    />
                </div>
            </div>

            <div className={styles.daysGrid}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={styles.dayHeader}>{day}</div>
                ))}
                {calendarDays.map((day, i) => {
                    const dayEvents = events.filter(event =>
                        isSameDay(new Date(event.startTime), day)
                    )

                    return (
                        <div
                            key={i}
                            className={`
                                ${styles.dayCell} 
                                ${!isSameMonth(day, monthStart) ? styles.outOfMonth : ''}
                                ${isSameDay(day, new Date()) ? styles.isToday : ''}
                            `}
                        >
                            <span className={styles.dayNumber}>{format(day, 'd')}</span>
                            <div className={styles.eventsList}>
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={styles.eventItem}
                                        onClick={() => onEventClick?.(event)}
                                        title={event.title}
                                    >
                                        <div className={styles.eventDot} />
                                        <span className={styles.eventTitle}>{event.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
