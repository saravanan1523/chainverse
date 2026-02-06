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

        const languages = await (prisma as any).language.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(languages)
    } catch (error) {
        console.error('[Languages API] Error fetching languages:', error)
        return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { language, proficiency } = await request.json()

        if (!language) {
            return NextResponse.json({ error: 'Language name is required' }, { status: 400 })
        }

        const newLanguage = await (prisma as any).language.create({
            data: {
                userId: session.user.id,
                language,
                proficiency
            }
        })

        return NextResponse.json(newLanguage)
    } catch (error) {
        console.error('[Languages API] Error creating language:', error)
        return NextResponse.json({ error: 'Failed to create language' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, language, proficiency } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Language ID is required' }, { status: 400 })
        }

        const updatedLanguage = await (prisma as any).language.update({
            where: {
                id,
                userId: session.user.id
            },
            data: {
                language,
                proficiency
            }
        })

        return NextResponse.json(updatedLanguage)
    } catch (error) {
        console.error('[Languages API] Error updating language:', error)
        return NextResponse.json({ error: 'Failed to update language' }, { status: 500 })
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
            return NextResponse.json({ error: 'Language ID is required' }, { status: 400 })
        }

        await (prisma as any).language.delete({
            where: {
                id,
                userId: session.user.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Languages API] Error deleting language:', error)
        return NextResponse.json({ error: 'Failed to delete language' }, { status: 500 })
    }
}
