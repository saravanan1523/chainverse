import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

// GET: Fetch connections (pending requests and accepted connections)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'all' // 'pending', 'accepted', 'all'

        let whereClause: any = {
            OR: [
                { requesterId: session.user.id },
                { receiverId: session.user.id }
            ]
        }

        if (type === 'pending') {
            whereClause = {
                receiverId: session.user.id,
                status: 'PENDING'
            }
        } else if (type === 'accepted') {
            whereClause = {
                ...whereClause,
                status: 'ACCEPTED'
            }
        }

        const connections = await prisma.connection.findMany({
            where: whereClause,
            include: {
                requester: {
                    select: { id: true, name: true, role: true, industry: true }
                },
                receiver: {
                    select: { id: true, name: true, role: true, industry: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Format for easier consumption
        const formatted = connections.map((conn: any) => {
            const isRequester = conn.requesterId === session.user.id
            const otherUser = isRequester ? conn.receiver : conn.requester
            return {
                id: conn.id,
                status: conn.status,
                isRequester,
                createdAt: conn.createdAt,
                user: otherUser
            }
        })

        return NextResponse.json(formatted)
    } catch (error) {
        console.error('[Connections GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
    }
}

// POST: Send a connection request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { receiverId } = body

        if (!receiverId || receiverId === session.user.id) {
            return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 })
        }

        // Check if connection already exists
        const existing = await prisma.connection.findFirst({
            where: {
                OR: [
                    { requesterId: session.user.id, receiverId: receiverId },
                    { requesterId: receiverId, receiverId: session.user.id }
                ]
            }
        })

        if (existing) {
            if (existing.status === 'PENDING') {
                return NextResponse.json({ error: 'Request already pending' }, { status: 409 })
            }
            if (existing.status === 'ACCEPTED') {
                return NextResponse.json({ error: 'Already connected' }, { status: 409 })
            }
            // If rejected, maybe allow re-request? For now, block.
            return NextResponse.json({ error: 'Cannot connect' }, { status: 400 })
        }

        const connection = await prisma.connection.create({
            data: {
                requesterId: session.user.id,
                receiverId,
                status: 'PENDING'
            }
        })

        // Notify receiver
        await createNotification(
            receiverId,
            'CONNECTION_REQUEST',
            'New Connection Request',
            `${session.user.name} wants to connect with you.`,
            '/mynetwork'
        )

        return NextResponse.json(connection)
    } catch (error) {
        console.error('[Connections POST] Error:', error)
        return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
    }
}

