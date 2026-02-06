import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
        return NextResponse.json([])
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ],
                NOT: {
                    email: session.user.email // Exclude self
                }
            },
            take: 10,
            select: {
                id: true,
                name: true,
                image: true,
                bio: true
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('User search error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
