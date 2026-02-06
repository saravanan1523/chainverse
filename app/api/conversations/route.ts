import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    has: session.user.id
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        })

        // We need to fetch the OTHER participants' info
        const enhancedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherParticipantIds = conv.participants.filter(id => id !== session.user.id)
            const otherUsers = await prisma.user.findMany({
                where: { id: { in: otherParticipantIds } },
                select: { id: true, name: true, isPremium: true }
            })

            return {
                ...conv,
                otherUser: otherUsers[0] || { name: 'Unknown User' },
                lastMessage: conv.messages[0],
                unreadCount: 0, // Simplified for now
            }
        }))

        return NextResponse.json(enhancedConversations)
    } catch (error) {
        console.error('[Conversations API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { recipientId } = await request.json()
        if (!recipientId) {
            return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
        }

        // Try to find existing conversation between these two
        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { has: session.user.id } },
                    { participants: { has: recipientId } }
                ]
            }
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participants: [session.user.id, recipientId],
                }
            })
        }

        return NextResponse.json(conversation)
    } catch (error) {
        console.error('[Conversations API] Error creating conversation:', error)
        return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 })
    }
}
