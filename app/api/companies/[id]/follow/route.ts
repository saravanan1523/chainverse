import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: companyId } = await params
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Check if already following
        const existingFollow = await prisma.companyFollow.findUnique({
            where: {
                userId_companyId: {
                    userId,
                    companyId
                }
            }
        })

        if (existingFollow) {
            // Unfollow
            await prisma.companyFollow.delete({
                where: {
                    id: existingFollow.id
                }
            })
            return NextResponse.json({ following: false })
        } else {
            // Follow
            await prisma.companyFollow.create({
                data: {
                    userId,
                    companyId
                }
            })
            return NextResponse.json({ following: true })
        }
    } catch (error) {
        console.error('[Company Follow API] Error:', error)
        return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 })
    }
}

// GET: Check if following
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: companyId } = await params
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ following: false })
        }

        const follow = await prisma.companyFollow.findUnique({
            where: {
                userId_companyId: {
                    userId: session.user.id,
                    companyId
                }
            }
        })

        return NextResponse.json({ following: !!follow })
    } catch (error) {
        return NextResponse.json({ following: false })
    }
}
