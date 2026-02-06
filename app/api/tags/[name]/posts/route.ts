import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeTagName } from '@/lib/tag-utils'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const normalizedName = normalizeTagName(name)
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Find tag
        const tag = await prisma.tag.findUnique({
            where: { name: normalizedName }
        })

        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
        }

        const postTags = await prisma.postTag.findMany({
            where: {
                tagId: tag.id,
                post: {
                    isPublished: true
                }
            },
            include: {
                post: {
                    include: {
                        author: {
                            select: { id: true, name: true, isPremium: true }
                        },
                        _count: {
                            select: { comments: true, reactions: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        })

        const posts = postTags.map(pt => pt.post).filter(p => p !== null)

        return NextResponse.json(posts)

    } catch (error) {
        console.error('[Tag Posts API] Error:', error)
        return NextResponse.json({
            error: 'Failed to fetch posts'
        }, { status: 500 })
    }
}
