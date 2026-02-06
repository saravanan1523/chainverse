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

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: session.user.id,
                    groupId: id,
                },
            },
        })

        return NextResponse.json({ isMember: !!membership, role: membership?.role })
    } catch (error) {
        console.error('[Group Membership GET] Error:', error)
        return NextResponse.json({ error: 'Failed to check membership' }, { status: 500 })
    }
}

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

        const membership = await prisma.groupMember.create({
            data: {
                userId: session.user.id,
                groupId: id,
                role: 'MEMBER',
            },
        })

        return NextResponse.json(membership)
    } catch (error) {
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: 'Already a member' }, { status: 400 })
        }
        console.error('[Group Membership POST] Error:', error)
        return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: session.user.id,
                    groupId: id,
                },
            },
        })

        return NextResponse.json({ message: 'Left group successfully' })
    } catch (error) {
        console.error('[Group Membership DELETE] Error:', error)
        return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 })
    }
}
