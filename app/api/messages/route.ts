import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId, content } = await request.json()
        if (!conversationId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        })

        if (!conversation || !conversation.participants.includes(session.user.id)) {
            return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 })
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: session.user.id,
                content,
                read: false,
            }
        })

        // Update lastMessageAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        })

        // Real-time: Emit to recipient via Socket.io
        try {
            const io = (global as any).io
            if (io) {
                // Determine recipient (the user who is NOT the sender)
                const recipientId = conversation.participants.find(id => id !== session.user.id)
                if (recipientId) {
                    io.to(recipientId).emit('new_message', {
                        ...message,
                        sender: {
                            id: session.user.id,
                            name: session.user.name,
                            // Add image if available in session, or handle in frontend
                        }
                    })
                }
            }
        } catch (socketError) {
            console.error('[Messages API] Socket emission failed:', socketError)
            // Don't block the response even if socket fails
        }

        return NextResponse.json(message)

    } catch (error) {
        console.error('[Messages API] Error sending message:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}
