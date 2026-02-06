import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const endorseSchema = z.object({
    skill: z.string().min(1)
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
        const { skill } = endorseSchema.parse(body)

        if (session.user.id === id) {
            return new NextResponse('Cannot endorse yourself', { status: 400 })
        }

        const existingEndorsement = await prisma.endorsement.findUnique({
            where: {
                userId_skill_endorserId: {
                    userId: id,
                    skill,
                    endorserId: session.user.id
                }
            }
        })

        if (existingEndorsement) {
            // Toggle off
            await prisma.endorsement.delete({
                where: { id: existingEndorsement.id }
            })
            return NextResponse.json({ endorsed: false })
        } else {
            // Toggle on
            await prisma.endorsement.create({
                data: {
                    userId: id,
                    skill,
                    endorserId: session.user.id
                }
            })
            return NextResponse.json({ endorsed: true })
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(error.message, { status: 400 })
        }
        console.error('Error toggling endorsement:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
