import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { normalizeTagName } from '@/lib/tag-utils'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name } = await params
        const normalizedName = normalizeTagName(name)

        // Find tag
        const tag = await prisma.tag.findUnique({
            where: { name: normalizedName }
        })

        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
        }

        // Check if already following
        const existing = await prisma.userTagFollow.findUnique({
            where: {
                userId_tagId: {
                    userId: session.user.id,
                    tagId: tag.id
                }
            }
        })

        if (existing) {
            // Unfollow
            await prisma.userTagFollow.delete({
                where: { id: existing.id }
            })

            // Decrement follower count
            await prisma.tag.update({
                where: { id: tag.id },
                data: { followerCount: { decrement: 1 } }
            })

            return NextResponse.json({ following: false })
        } else {
            // Follow
            await prisma.userTagFollow.create({
                data: {
                    userId: session.user.id,
                    tagId: tag.id
                }
            })

            // Increment follower count
            await prisma.tag.update({
                where: { id: tag.id },
                data: { followerCount: { increment: 1 } }
            })

            return NextResponse.json({ following: true })
        }

    } catch (error) {
        console.error('[Tag Follow API] Error:', error)
        return NextResponse.json({ error: 'Failed to follow/unfollow tag' }, { status: 500 })
    }
}
