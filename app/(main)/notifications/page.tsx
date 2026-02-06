'use client'

import { useEffect, useState } from 'react'
import { Button } from '@fluentui/react-components'
import {
    Alert24Regular,
    PersonAdd24Regular,
    Comment24Regular,
    CheckmarkCircle24Regular
} from '@fluentui/react-icons'
import styles from './notifications.module.css'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (Array.isArray(data)) setNotifications(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                body: JSON.stringify({ markAllRead: true })
            })
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case 'CONNECTION_REQUEST':
                return <PersonAdd24Regular className={styles.iconConn} />
            case 'CONNECTION_ACCEPTED':
                return <CheckmarkCircle24Regular className={styles.iconSuccess} />
            case 'COMMENT':
            case 'REACTION':
                return <Comment24Regular className={styles.iconComment} />
            default:
                return <Alert24Regular className={styles.iconDefault} />
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>Notifications</h1>
                <Button appearance="subtle" onClick={markAllRead}>Mark all as read</Button>
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <div className={styles.empty}>Loading...</div>
                ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                        <Link href={notification.link || '#'} key={notification.id} className={`${styles.item} ${!notification.read ? styles.unread : ''}`}>
                            <div className={styles.iconWrapper}>
                                {getIcon(notification.type)}
                            </div>
                            <div className={styles.content}>
                                <div className={styles.message}>
                                    <strong>{notification.title}</strong>
                                    <span>{notification.message}</span>
                                </div>
                                <div className={styles.time}>
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                            {!notification.read && <div className={styles.dot} />}
                        </Link>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                        <h3>No notifications yet</h3>
                        <p>We'll notify you when something important happens.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
