import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: groupId } = await params
        const userId = session.user.id

        // Check if group exists
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        })

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }

        // Check if already a member
        const existingMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId
                }
            }
        })

        if (existingMember) {
            return NextResponse.json({ error: 'Already a member' }, { status: 400 })
        }

        // Add member
        const member = await prisma.groupMember.create({
            data: {
                userId,
                groupId,
                role: 'MEMBER'
            }
        })

        return NextResponse.json(member)
    } catch (error) {
        console.error('Error joining group:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
