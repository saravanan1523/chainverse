import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // 'sent' or 'received'

        if (type === 'received') {
            // Recruiter view: Applications for jobs posted by current user
            const applications = await prisma.jobApplication.findMany({
                where: {
                    job: {
                        postedById: session.user.id
                    }
                },
                include: {
                    job: {
                        select: { title: true, company: true }
                    },
                    user: {
                        select: { id: true, name: true, image: true, bio: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json(applications)
        } else {
            // Candidate view: Applications sent by current user
            const applications = await prisma.jobApplication.findMany({
                where: {
                    userId: session.user.id
                },
                include: {
                    job: {
                        select: { id: true, title: true, company: true, location: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json(applications)
        }
    } catch (error) {
        console.error('[Applications GET API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }
}
