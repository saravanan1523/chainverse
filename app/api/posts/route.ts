import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { notifyNewsletterSubscribers } from "@/lib/notifications"
import { extractHashtags, normalizeTagName, getTagDisplayName } from '@/lib/tag-utils'
import { checkAndAwardBadges } from "@/lib/achievements"

const postCreateSchema = z.object({
    postType: z.enum(['CELEBRATION', 'INSIGHT', 'CASE_STUDY', 'SOP', 'INCIDENT', 'COMPANY_UPDATE', 'NEWSLETTER_EDITION']),
    title: z.string().min(1),
    content: z.string().min(1),
    tags: z.array(z.string()),
    companyId: z.string().optional(),
    groupId: z.string().optional(),
    mediaUrl: z.string().optional().nullable(),
    mediaType: z.string().optional().nullable(),
    attachments: z.array(z.object({
        url: z.string(),
        type: z.string(),
        name: z.string().optional(),
        size: z.number().optional(),
    })).optional(),
    isPublished: z.boolean().optional().default(true),
    scheduledFor: z.string().optional().nullable(),
    newsletterId: z.string().optional(),
})

// GET - Retrieve posts with filtering
export async function GET(req: Request) {
    console.log('[API] GET /api/posts called')
    try {
        const session = await getServerSession()
        const { searchParams } = new URL(req.url)
        const feedType = searchParams.get('feedType') // ops, people, company
        const tags = searchParams.get('tags')?.split(',')
        const authorId = searchParams.get('authorId')
        const companyIdParam = searchParams.get('companyId')
        const groupId = searchParams.get('groupId')

        // Build filter based on feed type
        let whereClause: any = {
            isPublished: true,
            OR: [
                { scheduledFor: null },
                { scheduledFor: { lte: new Date() } }
            ]
        }

        if (feedType === 'ops') {
            whereClause.postType = { in: ['CASE_STUDY', 'SOP', 'INSIGHT', 'INCIDENT'] }
        } else if (feedType === 'people' && session?.user?.id) {
            // Get accepted connections
            const connections = await prisma.connection.findMany({
                where: {
                    OR: [
                        { requesterId: session.user.id },
                        { receiverId: session.user.id }
                    ],
                    status: 'ACCEPTED'
                }
            })

            const connectedUserIds = connections.map(c =>
                c.requesterId === session.user.id ? c.receiverId : c.requesterId
            )

            // Personalize People Feed: Show posts from connections + global individual posts if connections empty
            if (connectedUserIds.length > 0) {
                whereClause.authorId = { in: connectedUserIds }
            }
            // Broaden types for people feed
            whereClause.postType = { in: ['CELEBRATION', 'INSIGHT', 'CASE_STUDY', 'SOP'] }
        } else if (feedType === 'people') {
            // Unauthenticated or fallback: show global celebrations
            whereClause.postType = { in: ['CELEBRATION'] }
        } else if (feedType === 'company' && session?.user?.id) {
            // Get followed companies
            const follows = await prisma.companyFollow.findMany({
                where: { userId: session.user.id }
            })
            const followedCompanyIds = follows.map(f => f.companyId)

            if (followedCompanyIds.length > 0) {
                whereClause.companyId = { in: followedCompanyIds }
            }
            // Broaden types for company feed
            whereClause.postType = { in: ['COMPANY_UPDATE', 'INSIGHT', 'CASE_STUDY', 'SOP'] }
        } else if (feedType === 'company') {
            // Unauthenticated or fallback: show global company updates
            whereClause.postType = { in: ['COMPANY_UPDATE'] }
        }

        // Apply mandatory search params override
        if (authorId) whereClause.authorId = authorId
        if (companyIdParam) whereClause.companyId = companyIdParam
        if (groupId) whereClause.groupId = groupId
        if (tags && tags.length > 0) {
            whereClause.tags = { hasSome: tags }
        }

        const posts = await prisma.post.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
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
                attachments: true,
                _count: {
                    select: {
                        comments: true,
                        reactions: true,
                    },
                },
            },
            orderBy: [
                { isPromoted: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 50,
        })

        if (!Array.isArray(posts)) {
            console.error('[API] Critical: prisma.post.findMany returned non-array:', posts)
            return NextResponse.json({ error: 'Database returned invalid data' }, { status: 500 })
        }

        console.log(`[API] Returning ${posts.length} posts`)
        return NextResponse.json(posts)
    } catch (error: any) {
        console.error("Error fetching posts:", error)
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Create a new post
export async function POST(req: Request) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const data = postCreateSchema.parse(body)

        // Create post
        const post = await prisma.post.create({
            data: {
                postType: data.postType,
                title: data.title,
                content: data.content,
                tags: data.tags,
                authorId: session.user.id,
                companyId: data.companyId,
                groupId: data.groupId,
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
                isPublished: data.isPublished,
                scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
                newsletterId: data.newsletterId,
                attachments: data.attachments ? {
                    create: data.attachments.map(att => ({
                        url: att.url,
                        type: att.type,
                        name: att.name,
                        size: att.size,
                    }))
                } : undefined
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        isPremium: true,
                    },
                },
                company: true,
                attachments: true,
            },
        })

        // Extract and process hashtags from content and title
        const hashtags = extractHashtags(data.content + ' ' + data.title)
        if (hashtags.length > 0) {
            for (const hashtagName of hashtags) {
                const normalizedName = normalizeTagName(hashtagName)

                // Find or create tag
                let tag = await prisma.tag.findUnique({
                    where: { name: normalizedName }
                })

                if (!tag) {
                    tag = await prisma.tag.create({
                        data: {
                            name: normalizedName,
                            displayName: getTagDisplayName(hashtagName),
                            postCount: 1,
                            lastUsedAt: new Date()
                        }
                    })
                } else {
                    // Update tag stats
                    await prisma.tag.update({
                        where: { id: tag.id },
                        data: {
                            postCount: { increment: 1 },
                            lastUsedAt: new Date()
                        }
                    })
                }

                // Link post to tag
                await prisma.postTag.create({
                    data: {
                        postId: post.id,
                        tagId: tag.id
                    }
                }).catch(() => { }) // Ignore duplicate errors
            }
        }

        // Notify subscribers if it's a published newsletter edition
        if (post.postType === 'NEWSLETTER_EDITION' && post.newsletterId && (post as any).isPublished && (!(post as any).scheduledFor || (post as any).scheduledFor <= new Date())) {
            // We don't await this to avoid blocking the user's response
            notifyNewsletterSubscribers(post.newsletterId, post.id)
        }

        // Trigger Badge Check
        checkAndAwardBadges(session.user.id)

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            )
        }

        console.error("Error creating post:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
