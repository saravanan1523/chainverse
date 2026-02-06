import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const certifications = await (prisma as any).certification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(certifications)
    } catch (error) {
        console.error('[Certifications API] Error fetching certifications:', error)
        return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, organization, issueDate, credentialId } = await request.json()

        if (!name || !organization) {
            return NextResponse.json({ error: 'Name and organization are required' }, { status: 400 })
        }

        const newCert = await (prisma as any).certification.create({
            data: {
                userId: session.user.id,
                name,
                organization,
                issueDate,
                credentialId
            }
        })

        return NextResponse.json(newCert)
    } catch (error) {
        console.error('[Certifications API] Error creating certification:', error)
        return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, name, organization, issueDate, credentialId } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 })
        }

        const updatedCert = await (prisma as any).certification.update({
            where: {
                id,
                userId: session.user.id
            },
            data: {
                name,
                organization,
                issueDate,
                credentialId
            }
        })

        return NextResponse.json(updatedCert)
    } catch (error) {
        console.error('[Certifications API] Error updating certification:', error)
        return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 })
        }

        await (prisma as any).certification.delete({
            where: {
                id,
                userId: session.user.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Certifications API] Error deleting certification:', error)
        return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 })
    }
}
