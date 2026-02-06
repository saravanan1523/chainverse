import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const events = await prisma.event.findMany({
            where: {
                startTime: {
                    gte: new Date() // Only upcoming events
                }
            },
            orderBy: {
                startTime: 'asc'
            },
            include: {
                group: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return NextResponse.json(events)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, startTime, location, link, isOnline } = body

        const event = await prisma.event.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                organizerId: session.user.id,
                location: isOnline ? 'Online' : location,
                link,
                isOnline,
                // Optional: connect to generic group if needed, or leave null for public events
                // For now, these are "Personal"/"Public" events not tied to a specific group unless passed
                // We'll leave groupId null for general events
            }
        })

        return NextResponse.json(event)
    } catch (error) {
        console.error('Create event error:', error)
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }
}
