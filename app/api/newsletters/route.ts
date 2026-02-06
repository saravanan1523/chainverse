import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const newsletterSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    logo: z.string().optional(),
    frequency: z.string().optional().default('Weekly'),
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const ownerId = searchParams.get('ownerId')

        const newsletters = await prisma.newsletter.findMany({
            where: {
                ...(ownerId && { ownerId })
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                _count: {
                    select: {
                        subscribers: true,
                        editions: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(newsletters)
    } catch (error) {
        console.error('[Newsletters GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch newsletters' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = newsletterSchema.parse(body)

        const newsletter = await prisma.newsletter.create({
            data: {
                title: data.title,
                description: data.description,
                logo: data.logo,
                frequency: data.frequency,
                ownerId: session.user.id,
                authorId: session.user.id, // Usually same as owner
            }
        })

        // Auto-subscribe the owner
        await prisma.newsletterSubscription.create({
            data: {
                userId: session.user.id,
                newsletterId: newsletter.id,
            }
        })

        return NextResponse.json(newsletter, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
        }
        console.error('[Newsletters POST] Error:', error)
        return NextResponse.json({ error: 'Failed to create newsletter' }, { status: 500 })
    }
}
