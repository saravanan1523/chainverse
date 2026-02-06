'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Dismiss24Regular,
    Send24Regular,
    Sparkle24Filled,
    Bot24Regular,
    Person24Regular
} from '@fluentui/react-icons'
import styles from './interviewSimulator.module.css'

interface InterviewSimulatorProps {
    isOpen: boolean
    onClose: () => void
    jobTitle: string
    jobDescription: string
}

interface Message {
    role: 'ai' | 'user'
    content: string
}

export function InterviewSimulator({ isOpen, onClose, jobTitle, jobDescription }: InterviewSimulatorProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [questions, setQuestions] = useState<string[]>([])
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen && questions.length === 0) {
            startInterview()
        }
    }, [isOpen])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const startInterview = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/ai/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'INTERVIEW_PREP',
                    payload: { jobDescription }
                })
            })

            if (res.ok) {
                const data = await res.json()
                setQuestions(data.questions)
                setMessages([
                    { role: 'ai', content: `Hello! I'm your AI Interview Coach. I've analyzed the ${jobTitle} role and prepared some questions for you. Let's start with the first one:` },
                    { role: 'ai', content: data.questions[0] }
                ])
            }
        } catch (err) {
            console.error('Interview start error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])

        // Advance to next question or conclude
        setTimeout(() => {
            if (currentQuestionIdx < questions.length - 1) {
                const nextIdx = currentQuestionIdx + 1
                setCurrentQuestionIdx(nextIdx)
                setMessages(prev => [...prev,
                { role: 'ai', content: "Great answer! Next question:" },
                { role: 'ai', content: questions[nextIdx] }
                ])
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "That concludes our mock interview! You handled the questions well. Keep practicing to refine your delivery." }])
            }
        }, 1000)
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.titleInfo}>
                        <Sparkle24Filled className={styles.aiIcon} />
                        <div>
                            <h3 className={styles.title}>Interview Simulator</h3>
                            <p className={styles.subtitle}>{jobTitle}</p>
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <Dismiss24Regular />
                    </button>
                </div>

                <div className={styles.chatArea}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`${styles.messageWrapper} ${styles[msg.role]}`}>
                            <div className={styles.avatar}>
                                {msg.role === 'ai' ? <Bot24Regular /> : <Person24Regular />}
                            </div>
                            <div className={styles.bubble}>{msg.content}</div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.messageWrapper} ${styles.ai}`}>
                            <div className={styles.avatar}><Bot24Regular /></div>
                            <div className={styles.bubble}>Preparing your interview...</div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                <div className={styles.inputArea}>
                    <input
                        type="text"
                        placeholder="Type your answer..."
                        className={styles.input}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className={styles.sendButton} onClick={handleSend} disabled={!input.trim()}>
                        <Send24Regular />
                    </button>
                </div>
            </div>
        </div>
    )
}
