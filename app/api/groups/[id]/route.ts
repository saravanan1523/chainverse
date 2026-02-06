import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { members: true }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }

        return NextResponse.json(group)
    } catch (error) {
        console.error('Error fetching group:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
