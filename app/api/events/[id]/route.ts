import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

// GET - Get event details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                group: { select: { id: true, name: true } },
                company: { select: { id: true, name: true } },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, role: true }
                        }
                    }
                }
            }
        })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        return NextResponse.json(event)

    } catch (error) {
        console.error('[Event API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }
}
