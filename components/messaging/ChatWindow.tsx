'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Send24Regular, Sparkle24Regular, Dismiss24Regular } from '@fluentui/react-icons'
import styles from './messaging.module.css'
import { useSession } from 'next-auth/react'
import { socket, connectSocket, disconnectSocket } from '@/lib/socket'

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: string
    sender: {
        id: string
        name: string
    }
}

interface ChatWindowProps {
    conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [newItem, setNewItem] = useState('')
    const [otherUser, setOtherUser] = useState<{ id: string, name: string, bio?: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // AI Features State
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isSummarizing, setIsSummarizing] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)

    // Real-time State
    const [isTyping, setIsTyping] = useState(false)
    const [isOtherUserOnline, setIsOtherUserOnline] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (conversationId) {
            fetchMessages()
            // Reset state on conversation change
            setSummary(null)
            setSuggestions([])
            setIsTyping(false)
        }
    }, [conversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Socket Integration
    useEffect(() => {
        if (session?.user?.id && otherUser?.id) {
            connectSocket(session.user.id)

            // Join conversation room if needed, or just rely on user room
            // current design emits to user ID, so we are good.

            const handleNewMessage = (message: Message) => {
                // Check if message belongs to current conversation
                // Since the message object might not have conversationId or we need to infer it
                // Ideally backend sends conversationId. 
                // However, based on API update, we are sending the whole message object which HAS conversationId
                if ((message as any).conversationId === conversationId || message.senderId === otherUser.id) {
                    setMessages(prev => [...prev, message])

                    // Clear typing indicator if they sent a message
                    setIsTyping(false)
                }
            }

            const handleTyping = (data: { userId: string, conversationId: string, isTyping: boolean }) => {
                if (data.conversationId === conversationId && data.userId === otherUser.id) {
                    setIsTyping(data.isTyping)
                }
            }

            const handleUserStatus = (data: { userId: string, status: string }) => {
                if (data.userId === otherUser.id) {
                    setIsOtherUserOnline(data.status === 'online')
                }
            }

            const handleonlineList = (users: string[]) => {
                if (users.includes(otherUser.id)) {
                    setIsOtherUserOnline(true)
                }
            }

            socket.on('new_message', handleNewMessage)
            socket.on('user_typing', handleTyping)
            socket.on('user_status', handleUserStatus)
            socket.on('online_users_list', handleonlineList)

            // Check initial status
            socket.emit('get_online_users')

            return () => {
                socket.off('new_message', handleNewMessage)
                socket.off('user_typing', handleTyping)
                socket.off('user_status', handleUserStatus)
                socket.off('online_users_list', handleonlineList)
            }
        }
    }, [session?.user?.id, conversationId, otherUser?.id])

    // Fetch smart replies when new messages arrive from other user
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1]
            if (lastMsg.senderId !== session?.user?.id) {
                fetchSmartReplies()
            } else {
                setSuggestions([])
            }
        }
    }, [messages, session?.user?.id])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchMessages = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/conversations/${conversationId}`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data.messages || [])
                setOtherUser(data.otherUser)
            }
        } catch (error) {
            console.error('Failed to load chat', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSmartReplies = async () => {
        try {
            const contextMessages = messages.slice(-5).map(m => ({
                content: m.content,
                isSender: m.senderId === session?.user?.id
            }))

            const res = await fetch('/api/ai/smart-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: contextMessages })
            })

            if (res.ok) {
                const data = await res.json()
                setSuggestions(data.suggestions || [])
            }
        } catch (error) {
            console.error('Failed to fetch smart replies', error)
        }
    }

    const handleSummarize = async () => {
        setIsSummarizing(true)
        try {
            const res = await fetch('/api/ai/conversation-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            })
            if (res.ok) {
                const data = await res.json()
                setSummary(data.summary)
            }
        } catch (error) {
            console.error('Failed to summarize', error)
        } finally {
            setIsSummarizing(false)
        }
    }

    const emitTyping = (isTypingStatus: boolean) => {
        if (otherUser && conversationId) {
            socket.emit(isTypingStatus ? 'typing_start' : 'typing_stop', {
                recipientId: otherUser.id,
                conversationId
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewItem(e.target.value)

        emitTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            emitTyping(false)
        }, 2000)
    }

    const handleSend = async () => {
        if (!newItem.trim()) return

        const content = newItem
        setNewItem('')
        // Optimistic update
        const tempId = Date.now().toString()
        const optimisticMsg: Message = {
            id: tempId,
            content,
            senderId: session?.user?.id || '',
            createdAt: new Date().toISOString(),
            sender: {
                id: session?.user?.id || '',
                name: session?.user?.name || ''
            }
        }
        setMessages(prev => [...prev, optimisticMsg])
        setSuggestions([])
        emitTyping(false)

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content
                })
            })

            if (res.ok) {
                const message = await res.json()
                // Replace optimistic message with real one
                setMessages(prev => prev.map(m => m.id === tempId ? {
                    ...message,
                    sender: {
                        id: session?.user?.id,
                        name: session?.user?.name
                    }
                } : m))
            } else {
                // Remove optimistic message on failure
                setMessages(prev => prev.filter(m => m.id !== tempId))
                console.error("Failed to send")
            }
        } catch (error) {
            console.error('Failed to send message', error)
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }

    if (isLoading) return <div className={styles.loading}>Loading chat...</div>

    return (
        <div className={styles.chatContainer}>
            {otherUser && (
                <div className={styles.chatHeader} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <Avatar name={otherUser.name} size={40} />
                            {isOtherUserOnline && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: '#10b981',
                                    border: '2px solid white'
                                }} />
                            )}
                        </div>
                        <div className={styles.headerInfo}>
                            <h3 className={styles.headerName}>{otherUser.name}</h3>
                            <p className={styles.headerBio}>
                                {isOtherUserOnline ? <span style={{ color: '#10b981', fontWeight: 500 }}>Online</span> : (otherUser.bio || 'ChainVerse Member')}
                            </p>
                        </div>
                    </div>
                    <Button
                        appearance="subtle"
                        icon={<Sparkle24Regular />}
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        title="Summarize Conversation"
                    />

                    {summary && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            left: 0,
                            zIndex: 10,
                            background: 'var(--color-bg-primary)',
                            borderBottom: '1px solid var(--color-border)',
                            padding: '16px',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-primary)' }}>✨ AI Summary</h4>
                                <button onClick={() => setSummary(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <Dismiss24Regular />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>{summary}</p>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.messagesArea}>
                {messages.map((msg) => {
                    const isMe = msg.senderId === session?.user?.id
                    return (
                        <div key={msg.id} className={`${styles.messageBubble} ${isMe ? styles.mine : styles.theirs}`}>
                            <div className={styles.bubbleContent}>
                                <p>{msg.content}</p>
                                <span className={styles.timestamp}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )
                })}
                {isTyping && (
                    <div className={`${styles.messageBubble} ${styles.theirs}`}>
                        <div className={styles.bubbleContent} style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <span style={{ width: '4px', height: '4px', background: '#ccc', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                                <span style={{ width: '4px', height: '4px', background: '#ccc', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                                <span style={{ width: '4px', height: '4px', background: '#ccc', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                {suggestions.length > 0 && (
                    <div className={styles.suggestionsContainer} style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto', background: 'var(--color-bg-primary)', borderTop: '1px solid var(--color-border)' }}>
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setNewItem(s)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--color-primary)',
                                    background: 'var(--color-bg-secondary)',
                                    color: 'var(--color-primary)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                <div style={{ position: 'relative', width: '100%' }}>
                    <textarea
                        className={styles.input}
                        placeholder="Write a message..."
                        value={newItem}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                    />
                </div>
                <Button
                    appearance="primary"
                    icon={<Send24Regular />}
                    onClick={handleSend}
                    disabled={!newItem.trim()}
                >
                    Send
                </Button>
            </div>
        </div>
    )
}
