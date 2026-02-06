'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Alert24Regular,
    Heart24Regular,
    Comment24Regular,
    Person24Regular
} from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { socket, connectSocket, disconnectSocket } from '@/lib/socket'
import styles from './notificationDropdown.module.css'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string
    read: boolean
    createdAt: string
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'POST_LIKE':
            return <Heart24Regular className={styles.iconLike} />
        case 'COMMENT':
            return <Comment24Regular className={styles.iconComment} />
        case 'CONNECTION_REQUEST':
            return <Person24Regular className={styles.iconPerson} />
        default:
            return <Alert24Regular />
    }
}

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
}

export function NotificationDropdown() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications')
            if (response.ok) {
                const data = await response.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications()

            // Connect to real-time socket
            connectSocket(session.user.id)

            // Listen for new notifications
            socket.on('new_notification', (notification: Notification) => {
                setNotifications(prev => [notification, ...prev])
                // Alert the user if the dropdown is closed? 
                // We'll just rely on the badge for now.
            })

            return () => {
                socket.off('new_notification')
                disconnectSocket()
            }
        }
    }, [session])

    const unreadCount = notifications.filter(n => !n.read).length

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            })
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            })
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    if (!session) return null

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <div className={styles.iconWrapper}>
                    <Alert24Regular />
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount}</span>
                    )}
                </div>
                <span className={styles.label}>Notifications</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className={styles.backdrop}
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={styles.dropdown}>
                        <div className={styles.header}>
                            <h3 className={styles.title}>Notifications</h3>
                            {unreadCount > 0 && (
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    onClick={handleMarkAllAsRead}
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>

                        <div className={styles.list}>
                            {isLoading ? (
                                <div className={styles.empty}>Loading notifications...</div>
                            ) : notifications.length === 0 ? (
                                <div className={styles.empty}>No notifications yet.</div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                                        onClick={() => {
                                            handleMarkAsRead(notification.id)
                                            setIsOpen(false)
                                            if (notification.link) {
                                                window.location.href = notification.link
                                            }
                                        }}
                                    >
                                        <div className={styles.iconContainer}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className={styles.content}>
                                            <p className={styles.notifTitle}>{notification.title}</p>
                                            {notification.message && (
                                                <p className={styles.message}>{notification.message}</p>
                                            )}
                                            <p className={styles.time}>
                                                {getRelativeTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className={styles.unreadDot} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={styles.footer}>
                            <a href="/notifications" className={styles.viewAll}>
                                See all notifications
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
