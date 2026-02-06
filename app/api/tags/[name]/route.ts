import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeTagName } from '@/lib/tag-utils'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const normalizedName = normalizeTagName(name)

        const tag = await prisma.tag.findUnique({
            where: { name: normalizedName },
            include: {
                _count: {
                    select: { posts: true, followers: true }
                }
            }
        })

        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
        }

        return NextResponse.json(tag)

    } catch (error) {
        console.error('[Tag Detail API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 })
    }
}
