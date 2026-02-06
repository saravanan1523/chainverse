import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

// PATCH: Accept or Reject connection
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

        const body = await request.json()
        const { status } = body // 'ACCEPTED' or 'REJECTED'

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const connection = await prisma.connection.findUnique({
            where: { id }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
        }

        // Only receiver can accept/reject
        if (connection.receiverId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        const updated = await prisma.connection.update({
            where: { id },
            data: { status }
        })

        if (status === 'ACCEPTED') {
            await createNotification(
                connection.requesterId,
                'CONNECTION_ACCEPTED',
                'Connection Accepted',
                `${session.user.name} accepted your connection request.`,
                `/profile/${session.user.id}`
            )
        }

        return NextResponse.json(updated)
    } catch (error) {
        console.error('[Connection PATCH] Error:', error)
        return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
    }
}

// DELETE: Remove connection or cancel request
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connection = await prisma.connection.findUnique({
            where: { id }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
        }

        // Participants can delete
        if (connection.requesterId !== session.user.id && connection.receiverId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        await prisma.connection.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Connection removed' })
    } catch (error) {
        console.error('[Connection DELETE] Error:', error)
        return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
    }
}
