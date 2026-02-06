import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { PostDetail } from '@/components/posts/PostDetail'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getPost(id: string) {
    try {
        console.log('[PostPage] Fetching post with ID:', id)
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isPremium: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                        verified: true,
                    },
                },
                _count: {
                    select: {
                        reactions: true,
                        comments: true,
                    },
                },
            },
        })

        console.log('[PostPage] Post found:', post ? 'YES' : 'NO')
        if (!post) {
            console.log('[PostPage] Post not found for ID:', id)
            return null
        }

        // Convert dates to strings for serialization
        return {
            ...post,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }
    } catch (error) {
        console.error('[PostPage] Error fetching post:', error)
        return null
    }
}

async function getUserReactions(postId: string, userId: string) {
    try {
        const reactions = await prisma.reaction.findMany({
            where: {
                postId,
                userId,
            },
        })

        return {
            isLiked: reactions.some(r => r.type === 'LIKE'),
            isSaved: reactions.some(r => r.type === 'SAVE'),
        }
    } catch (error) {
        console.error('Error fetching user reactions:', error)
        return { isLiked: false, isSaved: false }
    }
}

export default async function PostPage({ params }: PageProps) {
    try {
        const { id } = await params
        const session = await getServerSession()

        const post = await getPost(id)

        if (!post) {
            notFound()
        }

        // Increment view count
        try {
            await prisma.post.update({
                where: { id },
                data: { viewCount: { increment: 1 } },
            })
        } catch (error) {
            console.error('Error incrementing view count:', error)
        }

        let userReactions = { isLiked: false, isSaved: false }
        if (session?.user?.id) {
            userReactions = await getUserReactions(id, session.user.id)
        }

        return (
            <div className="container">
                <PostDetail
                    post={post}
                    isLiked={userReactions.isLiked}
                    isSaved={userReactions.isSaved}
                />
            </div>
        )
    } catch (error) {
        console.error('Error in PostPage:', error)
        throw error
    }
}
