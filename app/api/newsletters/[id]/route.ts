import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()
        const currentUserId = session?.user?.id

        const newsletter = await prisma.newsletter.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                editions: {
                    where: {
                        postType: 'NEWSLETTER_EDITION',
                        isPublished: true,
                        OR: [
                            { scheduledFor: null },
                            { scheduledFor: { lte: new Date() } }
                        ]
                    },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { id: true, name: true }
                        }
                    }
                },
                _count: {
                    select: {
                        subscribers: true,
                    }
                }
            }
        })

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
        }

        const isOwner = currentUserId === newsletter.ownerId

        // Fetch subscribers separately if owner to avoid complex conditional include types
        let subscribers = null
        if (isOwner) {
            subscribers = await prisma.newsletterSubscription.findMany({
                where: { newsletterId: id },
                include: {
                    user: {
                        select: { id: true, name: true, role: true }
                    }
                }
            })
        }

        // Calculate total views for owner
        let analytics = null
        if (isOwner) {
            const totalViews = (newsletter as any).editions.reduce((sum: number, ed: any) => sum + (ed.viewCount || 0), 0)
            analytics = { totalViews }
        }

        // Check if current user is subscribed
        let isSubscribed = false
        if (currentUserId) {
            const sub = await prisma.newsletterSubscription.findUnique({
                where: {
                    userId_newsletterId: {
                        userId: currentUserId,
                        newsletterId: id
                    }
                }
            })
            isSubscribed = !!sub
        }

        return NextResponse.json({
            ...newsletter,
            isSubscribed,
            isOwner,
            analytics,
            subscribers
        })
    } catch (error) {
        console.error('[Newsletter GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch newsletter' }, { status: 500 })
    }
}
