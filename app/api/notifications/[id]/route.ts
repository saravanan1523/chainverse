import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const notification = await prisma.notification.update({
            where: { id, userId: session.user.id },
            data: { read: true },
        })

        return NextResponse.json(notification)
    } catch (error) {
        console.error('[Notification ID API] Error updating notification:', error)
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }
}
