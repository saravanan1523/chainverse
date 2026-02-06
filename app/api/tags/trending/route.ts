import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const days = parseInt(searchParams.get('days') || '7')

        // Calculate date threshold for "trending"
        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - days)

        // Get tags with most activity in the last X days
        const tags = await prisma.tag.findMany({
            where: {
                lastUsedAt: {
                    gte: dateThreshold
                }
            },
            take: limit,
            orderBy: [
                { postCount: 'desc' },
                { followerCount: 'desc' }
            ],
            include: {
                _count: {
                    select: { posts: true, followers: true }
                }
            }
        })

        return NextResponse.json(tags)

    } catch (error) {
        console.error('[Trending Tags API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch trending tags' }, { status: 500 })
    }
}
