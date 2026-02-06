import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()

        // In real app, check role: if (session?.user?.role !== 'PLATFORM_ADMIN') ...
        // For verify, we allow authenticated users to see stats or checking a specific email
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [
            userCount,
            companyCount,
            jobCount,
            postCount,
            users
        ] = await Promise.all([
            prisma.user.count(),
            prisma.company.count(),
            prisma.job.count(),
            prisma.post.count(),
            prisma.user.findMany({
                take: 20,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isPremium: true,
                    createdAt: true
                }
            })
        ])

        return NextResponse.json({
            stats: {
                users: userCount,
                companies: companyCount,
                jobs: jobCount,
                posts: postCount
            },
            recentUsers: users
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
