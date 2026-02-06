import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Toggle reaction (like or save)
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params
    try {
        console.log('POST /api/posts/[id]/reactions - Start')
        console.log('Post ID:', params.id)

        const session = await getServerSession()
        console.log('Session:', session ? 'Found' : 'Not found')

        if (!session) {
            console.error('No session found')
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        console.log('User ID:', session.user.id)

        const body = await req.json()
        const { type } = body // 'LIKE' or 'SAVE'
        console.log('Reaction type:', type)

        if (!type || !['LIKE', 'SAVE'].includes(type)) {
            console.error('Invalid reaction type:', type)
            return NextResponse.json(
                { error: "Invalid reaction type" },
                { status: 400 }
            )
        }

        // Check if reaction already exists
        console.log('Checking for existing reaction...')
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                postId_userId_type: {
                    postId: params.id,
                    userId: session.user.id,
                    type,
                },
            },
        })
        console.log('Existing reaction:', existingReaction ? 'Found' : 'Not found')

        if (existingReaction) {
            // Remove reaction (toggle off)
            console.log('Removing reaction...')
            await prisma.reaction.delete({
                where: { id: existingReaction.id },
            })
            console.log('Reaction removed successfully')

            return NextResponse.json({ message: "Reaction removed", action: "removed" })
        } else {
            // Add reaction (toggle on)
            console.log('Adding reaction...')
            const reaction = await prisma.reaction.create({
                data: {
                    type,
                    postId: params.id,
                    userId: session.user.id,
                },
            })
            console.log('Reaction added successfully:', reaction.id)

            // Trigger notification for LIKE
            if (type === 'LIKE') {
                try {
                    const post = await prisma.post.findUnique({
                        where: { id: params.id },
                        select: { authorId: true, title: true }
                    })

                    if (post && post.authorId && post.authorId !== session.user.id) {
                        const { createNotification } = await import('@/lib/notifications')
                        await createNotification(
                            post.authorId,
                            'POST_LIKE',
                            `${session.user.name} liked your post`,
                            post.title,
                            `/post/${params.id}`
                        )
                    }
                } catch (notifError) {
                    console.error('Error triggering notification:', notifError)
                }
            }

            return NextResponse.json({ message: "Reaction added", action: "added", reaction })
        }
    } catch (error) {
        console.error("Error toggling reaction:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        if (error instanceof Error) {
            console.error("Error message:", error.message)
            console.error("Error stack:", error.stack)
        }
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

// GET - Get reactions for a post
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params
    try {
        const reactions = await prisma.reaction.findMany({
            where: { postId: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        // Group by type
        const likes = reactions.filter((r) => r.type === 'LIKE')
        const saves = reactions.filter((r) => r.type === 'SAVE')

        return NextResponse.json({
            likes: likes.length,
            saves: saves.length,
            likeUsers: likes.map((r) => r.user),
            saveUsers: saves.map((r) => r.user),
        })
    } catch (error) {
        console.error("Error fetching reactions:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
