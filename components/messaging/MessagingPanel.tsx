'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
    ChatMultiple24Regular,
    Dismiss24Regular,
    Search24Regular,
    Send24Regular,
    Attach24Regular,
    Image24Regular,
    Document24Regular,
    Delete24Regular
} from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { Avatar } from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { socket, connectSocket, disconnectSocket } from '@/lib/socket'
import styles from './messagingPanel.module.css'
import { useMessaging } from '@/context/MessagingContext'

interface Conversation {
    id: string
    otherUser: {
        id: string
        name: string
        image?: string
    }
    lastMessage?: {
        content: string
        createdAt: string
    }
    unreadCount: number
}

interface Message {
    id: string
    senderId: string
    content: string
    createdAt: string
    attachments?: any[]
}

export function MessagingPanel() {
    const { data: session } = useSession()
    const { isPanelOpen: isOpen, openPanel, closePanel, targetUserId } = useMessaging()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversation, setActiveConversation] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [attachments, setAttachments] = useState<any[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isTypingRef = useRef(false)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/conversations')
            if (response.ok) {
                const data = await response.json()
                setConversations(data)
                return data
            }
        } catch (error) {
            console.error('Error fetching conversations:', error)
        }
        return []
    }

    const fetchMessages = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/conversations/${conversationId}/messages`)
            if (response.ok) {
                const data = await response.json()
                setMessages(data)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    // Socket Integration
    useEffect(() => {
        if (session?.user?.id && isOpen) {
            connectSocket(session.user.id)
            fetchConversations()

            socket.on('new_message', (message: Message) => {
                // If message belongs to active conversation, update messages
                // We don't have conversationId on the message yet, maybe we should add it?
                // For now, let's assume we need to re-fetch conversations to update last message/unread
                fetchConversations()

                // If it's for the current active conversation, we should probably re-fetch messages
                // or the server should send the conversationId
            })

            socket.on('user_typing', (data: { userId: string, conversationId: string, isTyping: boolean }) => {
                if (data.conversationId === activeConversation) {
                    setTypingUsers(prev => ({ ...prev, [data.userId]: data.isTyping }))
                }
            })

            socket.on('user_status', (data: { userId: string, status: string }) => {
                if (data.status === 'online') {
                    setOnlineUsers(prev => [...new Set([...prev, data.userId])])
                } else {
                    setOnlineUsers(prev => prev.filter(id => id !== data.userId))
                }
            })

            socket.on('online_users_list', (users: string[]) => {
                setOnlineUsers(users)
            })

            socket.emit('get_online_users')

            return () => {
                socket.off('new_message')
                socket.off('user_typing')
                socket.off('user_status')
                socket.off('online_users_list')
                disconnectSocket()
            }
        }
    }, [session, isOpen, activeConversation])

    // Specific New Message listener that needs activeConversation
    useEffect(() => {
        if (!socket) return

        const handleNewMessage = (message: any) => {
            // Check if this message belongs to the active conversation
            // The message object from server should ideally have conversationId or we verify sender
            if (activeConversation) {
                // For simplicity, if we get a new message and panel is open, we refresh
                fetchMessages(activeConversation)
                fetchConversations()
            }
        }

        socket.on('new_message', handleNewMessage)
        return () => { socket.off('new_message', handleNewMessage) }
    }, [activeConversation])

    useEffect(() => {
        const initTargetChat = async () => {
            if (targetUserId && isOpen) {
                try {
                    const response = await fetch('/api/conversations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ recipientId: targetUserId }),
                    })
                    if (response.ok) {
                        const conv = await response.json()
                        setActiveConversation(conv.id)
                        fetchMessages(conv.id)
                        fetchConversations()
                    }
                } catch (error) {
                    console.error('Error starting conversation:', error)
                }
            }
        }
        initTargetChat()
    }, [targetUserId, isOpen])

    const handleOpenConversation = (conversationId: string) => {
        setActiveConversation(conversationId)
        fetchMessages(conversationId)
        setTypingUsers({}) // Clear typing for new conversation
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('type', file.type)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (res.ok) {
                    const data = await res.json()
                    setAttachments(prev => [...prev, {
                        url: data.url,
                        type: data.type,
                        name: file.name,
                        size: file.size
                    }])
                }
            }
        } catch (error) {
            console.error('Upload Error:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const removeAttachment = (url: string) => {
        setAttachments(prev => prev.filter(att => att.url !== url))
    }

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && attachments.length === 0) || !activeConversation) return

        const content = newMessage
        const currentAttachments = [...attachments]
        setNewMessage('')
        setAttachments([])
        handleTypingStop()

        try {
            const response = await fetch(`/api/conversations/${activeConversation}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    attachments: currentAttachments
                }),
            })

            if (response.ok) {
                const sentMsg = await response.json()
                setMessages(prev => [...prev, sentMsg])

                // Emit to recipient via socket for instant update
                const activeConv = conversations.find(c => c.id === activeConversation)
                if (activeConv) {
                    socket.emit('send_message', {
                        recipientId: activeConv.otherUser.id,
                        message: sentMsg
                    })
                }

                fetchConversations()
            }
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const handleTypingStart = () => {
        if (!activeConversation || isTypingRef.current) return

        const activeConv = conversations.find(c => c.id === activeConversation)
        if (activeConv) {
            isTypingRef.current = true
            socket.emit('typing_start', {
                recipientId: activeConv.otherUser.id,
                conversationId: activeConversation
            })
        }
    }

    const handleTypingStop = () => {
        if (!activeConversation || !isTypingRef.current) return

        const activeConv = conversations.find(c => c.id === activeConversation)
        if (activeConv) {
            isTypingRef.current = false
            socket.emit('typing_stop', {
                recipientId: activeConv.otherUser.id,
                conversationId: activeConversation
            })
        }
    }

    const onInputChange = (val: string) => {
        setNewMessage(val)
        handleTypingStart()

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(handleTypingStop, 2000)
    }

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeConv = conversations.find(c => c.id === activeConversation)
    const isOtherUserTyping = activeConv && typingUsers[activeConv.otherUser.id]

    if (!session) return null

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => isOpen ? closePanel() : openPanel()}
                aria-label="Messages"
            >
                <div className={styles.iconWrapper}>
                    <ChatMultiple24Regular />
                    {conversations.reduce((s, c) => s + c.unreadCount, 0) > 0 && (
                        <span className={styles.badge}>{conversations.reduce((s, c) => s + c.unreadCount, 0)}</span>
                    )}
                </div>
                <span className={styles.label}>Messaging</span>
            </button>

            {isOpen && (
                <>
                    <div className={styles.backdrop} onClick={closePanel} />
                    <div className={styles.panel}>
                        <div className={styles.header}>
                            <h3 className={styles.title}>Messaging</h3>
                            <button className={styles.closeButton} onClick={closePanel}>
                                <Dismiss24Regular />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.conversationList}>
                                <div className={styles.searchContainer}>
                                    <Search24Regular className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search messages"
                                        className={styles.searchInput}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className={styles.conversations}>
                                    {filteredConversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className={`${styles.conversationItem} ${activeConversation === conv.id ? styles.active : ''}`}
                                            onClick={() => handleOpenConversation(conv.id)}
                                        >
                                            <div className={styles.avatarWrapper}>
                                                <Avatar name={conv.otherUser.name} size="medium" />
                                                {onlineUsers.includes(conv.otherUser.id) && (
                                                    <span className={styles.onlineStatus} />
                                                )}
                                            </div>
                                            <div className={styles.convInfo}>
                                                <div className={styles.convHeader}>
                                                    <span className={styles.convName}>{conv.otherUser.name}</span>
                                                    <span className={styles.convTime}>
                                                        {conv.lastMessage && formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className={styles.convLastMessage}>
                                                    {conv.lastMessage?.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {activeConversation && activeConv && (
                                <div className={styles.messageThread}>
                                    <div className={styles.threadHeader}>
                                        <Avatar name={activeConv.otherUser.name} size="small" />
                                        <div className={styles.threadInfo}>
                                            <span className={styles.threadName}>{activeConv.otherUser.name}</span>
                                            {onlineUsers.includes(activeConv.otherUser.id) && (
                                                <span className={styles.onlineText}>Online</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.messages}>
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`${styles.message} ${msg.senderId === session?.user?.id ? styles.sent : styles.received}`}
                                            >
                                                <div className={styles.messageBubble}>
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className={styles.messageAttachments}>
                                                            {msg.attachments.map((att: any, idx: number) => (
                                                                <div key={idx} className={styles.msgAttachment}>
                                                                    {att.type.startsWith('image/') ? (
                                                                        <img src={att.url} alt={att.name} className={styles.msgImage} />
                                                                    ) : (
                                                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className={styles.msgFile}>
                                                                            <Document24Regular />
                                                                            <span>{att.name}</span>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {msg.content}
                                                </div>
                                                <span className={styles.messageTime}>
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        ))}
                                        {isOtherUserTyping && (
                                            <div className={`${styles.message} ${styles.received}`}>
                                                <div className={styles.typingIndicator}>
                                                    <span></span><span></span><span></span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className={styles.inputArea}>
                                        {attachments.length > 0 && (
                                            <div className={styles.inputPreviews}>
                                                {attachments.map((att) => (
                                                    <div key={att.url} className={styles.previewItem}>
                                                        {att.type.startsWith('image/') ? (
                                                            <div className={styles.previewThumb} style={{ backgroundImage: `url(${att.url})` }} />
                                                        ) : (
                                                            <Document24Regular />
                                                        )}
                                                        <button onClick={() => removeAttachment(att.url)} className={styles.removePreview}>
                                                            <Dismiss24Regular />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className={styles.inputContainer}>
                                            <button
                                                className={styles.attachButton}
                                                onClick={() => document.getElementById('msg-attach')?.click()}
                                                disabled={isUploading}
                                            >
                                                <Attach24Regular />
                                            </button>
                                            <input
                                                id="msg-attach"
                                                type="file"
                                                multiple
                                                style={{ display: 'none' }}
                                                onChange={handleFileUpload}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Write a message..."
                                                className={styles.messageInput}
                                                value={newMessage}
                                                onChange={(e) => onInputChange(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <button
                                                className={styles.sendButton}
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim() && attachments.length === 0}
                                            >
                                                <Send24Regular />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
