import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeTagName, isValidTagName } from '@/lib/tag-utils'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')
        const limit = parseInt(searchParams.get('limit') || '20')

        const whereClause: any = {}

        if (query) {
            whereClause.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { displayName: { contains: query, mode: 'insensitive' } }
            ]
        }

        const tags = await prisma.tag.findMany({
            where: whereClause,
            take: limit,
            orderBy: { postCount: 'desc' },
            include: {
                _count: {
                    select: { posts: true, followers: true }
                }
            }
        })

        return NextResponse.json(tags)

    } catch (error) {
        console.error('[Tags API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, description } = await request.json()

        if (!name || !isValidTagName(name)) {
            return NextResponse.json({ error: 'Invalid tag name' }, { status: 400 })
        }

        const normalizedName = normalizeTagName(name)
        const displayName = name // Keep original casing for display

        // Check if tag exists
        const existing = await prisma.tag.findUnique({
            where: { name: normalizedName }
        })

        if (existing) {
            return NextResponse.json(existing)
        }

        // Create new tag
        const tag = await prisma.tag.create({
            data: {
                name: normalizedName,
                displayName,
                description: description || null
            }
        })

        return NextResponse.json(tag)

    } catch (error) {
        console.error('[Tags API] Error creating tag:', error)
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
    }
}
