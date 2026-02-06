import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const pollSchema = z.object({
    question: z.string().min(1),
    description: z.string().optional(),
    groupId: z.string(),
    options: z.array(z.string().min(1)).min(2),
    expiresAt: z.string().optional(),
    isMultiple: z.boolean().default(false)
})

// GET - List polls (for a group or all)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const groupId = searchParams.get('groupId')
        const limit = parseInt(searchParams.get('limit') || '20')

        const where: any = {}
        if (groupId) {
            where.groupId = groupId
        }

        const polls = await prisma.poll.findMany({
            where,
            include: {
                group: { select: { id: true, name: true } },
                options: {
                    select: { id: true, text: true, voteCount: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return NextResponse.json(polls)

    } catch (error) {
        console.error('[Polls API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 })
    }
}

// POST - Create a new poll
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = pollSchema.parse(body)

        // Check if user is member of the group
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: session.user.id,
                    groupId: data.groupId
                }
            }
        })

        if (!membership) {
            return NextResponse.json({ error: 'Must be a group member to create polls' }, { status: 403 })
        }

        const poll = await prisma.poll.create({
            data: {
                question: data.question,
                description: data.description,
                groupId: data.groupId,
                authorId: session.user.id,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                isMultiple: data.isMultiple,
                options: {
                    create: data.options.map(text => ({ text }))
                }
            },
            include: {
                options: true
            }
        })

        return NextResponse.json(poll, { status: 201 })

    } catch (error) {
        console.error('[Polls API] Error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid poll data', details: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
    }
}
