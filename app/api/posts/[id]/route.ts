import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Retrieve single post with details
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const post = await prisma.post.findUnique({
            where: { id: id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        isPremium: true,
                        company: true,
                    },
                },
                company: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        })

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        // Increment view count
        await prisma.post.update({
            where: { id: id },
            data: { viewCount: { increment: 1 } },
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error("Error fetching post:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PATCH - Update post (author only)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const post = await prisma.post.findUnique({
            where: { id: id },
        })

        if (!post || post.authorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { title, content, tags } = body

        const updatedPost = await prisma.post.update({
            where: { id: id },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(tags && { tags }),
            },
            include: {
                author: true,
                company: true,
            },
        })

        return NextResponse.json(updatedPost)
    } catch (error) {
        console.error("Error updating post:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE - Delete post (author only)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const post = await prisma.post.findUnique({
            where: { id: id },
        })

        if (!post || post.authorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.post.delete({
            where: { id: id },
        })

        return NextResponse.json({ message: "Post deleted successfully" })
    } catch (error) {
        console.error("Error deleting post:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
