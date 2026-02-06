'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface MessagingContextType {
    isPanelOpen: boolean
    openPanel: (userId?: string) => void
    closePanel: () => void
    targetUserId: string | null
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [targetUserId, setTargetUserId] = useState<string | null>(null)

    const openPanel = useCallback((userId?: string) => {
        setIsPanelOpen(true)
        if (userId) {
            setTargetUserId(userId)
        }
    }, [])

    const closePanel = useCallback(() => {
        setIsPanelOpen(false)
        setTargetUserId(null)
    }, [])

    return (
        <MessagingContext.Provider value={{ isPanelOpen, openPanel, closePanel, targetUserId }}>
            {children}
        </MessagingContext.Provider>
    )
}

export function useMessaging() {
    const context = useContext(MessagingContext)
    if (context === undefined) {
        throw new Error('useMessaging must be used within a MessagingProvider')
    }
    return context
}
