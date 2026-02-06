import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        })

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        // Verify participation
        if (!conversation.participants.includes(session.user.id)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // Get other participant details
        const otherParticipantId = conversation.participants.find(p => p !== session.user.id)
        let otherUser = null
        if (otherParticipantId) {
            otherUser = await prisma.user.findUnique({
                where: { id: otherParticipantId },
                select: { id: true, name: true, bio: true, isPremium: true }
            })
        }

        return NextResponse.json({
            ...conversation,
            otherUser
        })

    } catch (error) {
        console.error('[Conversation Detail API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
    }
}
