import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: postId } = await params

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        // Check if already saved
        const existing = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId
                }
            }
        })

        if (existing) {
            // Unsave
            await prisma.savedPost.delete({
                where: { id: existing.id }
            })
            return NextResponse.json({ saved: false })
        } else {
            // Save
            await prisma.savedPost.create({
                data: {
                    userId: session.user.id,
                    postId
                }
            })
            return NextResponse.json({ saved: true })
        }

    } catch (error) {
        console.error('[Save Post API] Error:', error)
        return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ saved: false })
        }

        const { id: postId } = await params

        const saved = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId
                }
            }
        })

        return NextResponse.json({ saved: !!saved })

    } catch (error) {
        console.error('[Save Post API] Error:', error)
        return NextResponse.json({ error: 'Failed to check saved status' }, { status: 500 })
    }
}
