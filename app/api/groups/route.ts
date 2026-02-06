import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const userId = session.user.id

        // Fetch groups the user is a member of
        const myGroups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        })

        // Fetch other groups (suggested) - for now, just groups user is NOT in
        const suggestedGroups = await prisma.group.findMany({
            where: {
                members: {
                    none: {
                        userId: userId
                    }
                },
                type: 'PUBLIC'
            },
            take: 5,
            include: {
                _count: {
                    select: { members: true }
                }
            }
        })

        return NextResponse.json({
            myGroups,
            suggestedGroups
        })
    } catch (error) {
        console.error('Error fetching groups:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        console.error('POST /api/groups - No session or user')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, description, industry, location, rules, type } = body

        console.log('POST /api/groups - Request body:', { name, description, industry, location, rules, type })
        console.log('POST /api/groups - User ID:', session.user.id)

        // Basic validation
        if (!name || !description) {
            console.error('POST /api/groups - Missing required fields')
            return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
        }

        console.log('POST /api/groups - Creating group...')
        const newGroup = await prisma.group.create({
            data: {
                name,
                description,
                industry: industry || null,
                location: location || null,
                rules: rules || null,
                type: type === 'private' ? 'PRIVATE' : 'PUBLIC',
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'ADMIN'
                    }
                }
            }
        })

        console.log('POST /api/groups - Group created successfully:', newGroup.id)
        return NextResponse.json(newGroup)
    } catch (error) {
        console.error('POST /api/groups - Error creating group:', error)
        console.error('POST /api/groups - Error details:', JSON.stringify(error, null, 2))
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
