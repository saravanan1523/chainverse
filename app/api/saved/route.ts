import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')

        const savedPosts = await prisma.savedPost.findMany({
            where: { userId: session.user.id },
            include: {
                post: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                                isPremium: true
                            }
                        },
                        company: {
                            select: {
                                id: true,
                                name: true,
                                verified: true
                            }
                        },
                        _count: {
                            select: {
                                comments: true,
                                reactions: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        })

        const posts = savedPosts.map(sp => ({
            ...sp.post,
            savedAt: sp.createdAt
        }))

        return NextResponse.json({ savedPosts: posts })

    } catch (error) {
        console.error('[Saved Posts API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: 500 })
    }
}
