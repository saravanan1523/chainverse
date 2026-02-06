import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // 1. Get User Profile Views
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { viewCount: true }
        })

        // 2. Aggregate Post Views
        const posts = await prisma.post.findMany({
            where: { authorId: userId },
            select: {
                id: true,
                title: true,
                viewCount: true,
                createdAt: true,
                postType: true
            },
            orderBy: { viewCount: 'desc' }
        })

        const totalPostViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0)

        // 3. Aggregate Newsletter Stats
        const newsletters = await prisma.newsletter.findMany({
            where: { ownerId: userId },
            include: {
                _count: {
                    select: { subscribers: true }
                }
            }
        })

        const totalSubscribers = newsletters.reduce((sum, n) => sum + n._count.subscribers, 0)

        // 4. Top Performing Posts
        const topPosts = posts.slice(0, 5)

        return NextResponse.json({
            profileViews: user?.viewCount || 0,
            totalPostViews,
            totalSubscribers,
            newsletterCount: newsletters.length,
            topPosts,
            postCount: posts.length
        })

    } catch (error) {
        console.error('[Analytics GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
