import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const rsvpSchema = z.object({
    status: z.enum(['GOING', 'INTERESTED', 'NOT_GOING'])
})

// POST - RSVP to an event
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: eventId } = await params
        const body = await request.json()
        const { status } = rsvpSchema.parse(body)

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // Upsert the RSVP
        const rsvp = await prisma.eventParticipant.upsert({
            where: {
                eventId_userId: {
                    eventId,
                    userId: session.user.id
                }
            },
            update: { status },
            create: {
                eventId,
                userId: session.user.id,
                status
            }
        })

        return NextResponse.json(rsvp)

    } catch (error) {
        console.error('[RSVP API] Error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid RSVP status' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to RSVP' }, { status: 500 })
    }
}

// DELETE - Cancel RSVP
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: eventId } = await params

        await prisma.eventParticipant.deleteMany({
            where: {
                eventId,
                userId: session.user.id
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[RSVP API] Error:', error)
        return NextResponse.json({ error: 'Failed to cancel RSVP' }, { status: 500 })
    }
}
