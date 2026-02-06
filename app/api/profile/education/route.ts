import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 })
        }

        const education = await prisma.education.findMany({
            where: { userId },
            orderBy: { startDate: 'desc' }
        })

        return NextResponse.json(education)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { school, degree, fieldOfStudy, startDate, endDate } = body

        const education = await prisma.education.create({
            data: {
                userId: session.user.id,
                school,
                degree,
                fieldOfStudy,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null
            }
        })

        return NextResponse.json(education)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to add education' }, { status: 500 })
    }
}
