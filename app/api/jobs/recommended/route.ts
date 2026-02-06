import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { getRecommendedJobs } from '@/lib/job-matching'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user with skills
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { skills: true }
        })

        if (!user || !user.skills || user.skills.length === 0) {
            // Return empty array if user has no skills
            return NextResponse.json([])
        }

        // Get all active jobs
        const jobs = await prisma.job.findMany({
            include: {
                postedBy: {
                    select: { id: true, name: true, isPremium: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent jobs for performance
        })

        // Get recommended jobs using matching algorithm
        const recommended = getRecommendedJobs(jobs, user.skills, 10)

        return NextResponse.json(recommended)

    } catch (error) {
        console.error('[Recommended Jobs API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch recommended jobs' }, { status: 500 })
    }
}
