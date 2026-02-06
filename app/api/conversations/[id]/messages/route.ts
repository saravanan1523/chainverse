import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, name: true, isPremium: true }
                },
                attachments: true
            }
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('[Messages GET API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { content, attachments } = await request.json()
        if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
            return NextResponse.json({ error: 'Message content or attachments required' }, { status: 400 })
        }

        const message = await prisma.message.create({
            data: {
                content: content || '',
                conversationId: id,
                senderId: session.user.id,
                attachments: attachments ? {
                    create: attachments.map((att: any) => ({
                        url: att.url,
                        type: att.type,
                        name: att.name,
                        size: att.size,
                    }))
                } : undefined
            },
            include: {
                sender: {
                    select: { id: true, name: true, isPremium: true }
                },
                attachments: true
            }
        })

        // Update conversation lastMessageAt
        await prisma.conversation.update({
            where: { id },
            data: { lastMessageAt: new Date() }
        })

        return NextResponse.json(message)
    } catch (error) {
        console.error('[Messages POST API] Error:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}
