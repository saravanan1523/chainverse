import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

// GET: Fetch user's experience
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 })
        }

        const experience = await prisma.experience.findMany({
            where: { userId },
            orderBy: { startDate: 'desc' }
        })

        return NextResponse.json(experience)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch experience' }, { status: 500 })
    }
}

// POST: Add new experience
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, company, location, startDate, endDate, current, description } = body

        const experience = await prisma.experience.create({
            data: {
                userId: session.user.id,
                title,
                company,
                location,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                current: current || false,
                description
            }
        })

        return NextResponse.json(experience)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to add experience' }, { status: 500 })
    }
}
