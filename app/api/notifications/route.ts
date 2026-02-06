import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        return NextResponse.json(notifications)
    } catch (error) {
        console.error('[Notifications GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, markAllRead } = body

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false
                },
                data: {
                    read: true
                }
            })
            return NextResponse.json({ success: true })
        }

        if (id) {
            await prisma.notification.update({
                where: {
                    id,
                    userId: session.user.id // Ensure ownership
                },
                data: {
                    read: true
                }
            })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    } catch (error) {
        console.error('[Notifications PATCH] Error:', error)
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }
}
