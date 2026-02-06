import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const comments = await prisma.comment.findMany({
            where: { postId: id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isPremium: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(comments)
    } catch (error) {
        console.error('[Comments API] Error fetching comments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { content } = await request.json()

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            )
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId: id,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isPremium: true,
                    },
                },
            },
        })

        // Trigger notification for COMMENT
        try {
            const post = await prisma.post.findUnique({
                where: { id },
                select: { authorId: true, title: true }
            })

            if (post && post.authorId && post.authorId !== session.user.id) {
                const { createNotification } = await import('@/lib/notifications')
                await createNotification(
                    post.authorId,
                    'COMMENT',
                    `${session.user.name} commented on your post`,
                    content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                    `/post/${id}`
                )
            }
        } catch (notifError) {
            console.error('Error triggering notification:', notifError)
        }

        return NextResponse.json(comment)
    } catch (error) {
        console.error('[Comments API] Error creating comment:', error)
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        )
    }
}
