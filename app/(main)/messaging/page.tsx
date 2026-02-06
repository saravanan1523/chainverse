'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useSession } from 'next-auth/react'
import { ConversationList } from '@/components/messaging/ConversationList'
import { ChatWindow } from '@/components/messaging/ChatWindow'

export default function MessagingPage() {
    const { data: session } = useSession()
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

    return (
        <div style={{ height: '100%', padding: '0 24px 24px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <Card style={{ width: '450px', height: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <ConversationList
                    onSelect={setSelectedId}
                    selectedId={selectedId}
                />
            </Card>

            <Card style={{ width: '450px', height: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {selectedId ? (
                    <ChatWindow conversationId={selectedId} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)', gap: '16px' }}>
                        <div style={{ fontSize: '64px', color: 'var(--color-text-tertiary)', opacity: 0.5 }}>💬</div>
                        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Select a conversation to start messaging</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
