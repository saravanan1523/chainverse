import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const recommendationSchema = z.object({
    content: z.string().min(10, 'Recommendation must be at least 10 characters'),
    relation: z.string().min(1, 'Relationship is required')
})

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { content, relation } = recommendationSchema.parse(body)

        if (session.user.id === id) {
            return new NextResponse('Cannot recommend yourself', { status: 400 })
        }

        // Check if already recommended, update if so
        const existing = await prisma.recommendation.findFirst({
            where: {
                receiverId: id,
                authorId: session.user.id
            }
        })

        if (existing) {
            const updated = await prisma.recommendation.update({
                where: { id: existing.id },
                data: { content, relation }
            })
            return NextResponse.json(updated)
        } else {
            const created = await prisma.recommendation.create({
                data: {
                    receiverId: id,
                    authorId: session.user.id,
                    content,
                    relation
                }
            })
            return NextResponse.json(created)
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(error.message, { status: 400 })
        }
        console.error('Error creating recommendation:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
