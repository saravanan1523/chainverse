import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const subscriptions = await prisma.newsletterSubscription.findMany({
            where: { userId: session.user.id },
            include: {
                newsletter: {
                    include: {
                        owner: {
                            select: { id: true, name: true }
                        },
                        _count: {
                            select: {
                                subscribers: true,
                                editions: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const newsletters = subscriptions.map(sub => sub.newsletter)
        return NextResponse.json(newsletters)
    } catch (error) {
        console.error('[Subscribed Newsletters GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }
}
