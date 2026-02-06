import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        const existingSub = await prisma.newsletterSubscription.findUnique({
            where: {
                userId_newsletterId: {
                    userId,
                    newsletterId: id
                }
            }
        })

        if (existingSub) {
            // Unsubscribe
            await prisma.newsletterSubscription.delete({
                where: { id: existingSub.id }
            })
            return NextResponse.json({ subscribed: false })
        } else {
            // Subscribe
            await prisma.newsletterSubscription.create({
                data: {
                    userId,
                    newsletterId: id
                }
            })
            return NextResponse.json({ subscribed: true })
        }
    } catch (error) {
        console.error('[Newsletter Subscribe] Error:', error)
        return NextResponse.json({ error: 'Failed to toggle subscription' }, { status: 500 })
    }
}
