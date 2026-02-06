import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')
        const type = searchParams.get('type') || 'all'

        if (!q || q.length < 2) {
            return NextResponse.json({
                posts: [],
                people: [],
                jobs: [],
                companies: [],
                groups: [],
                tags: []
            })
        }

        const results: any = {}

        // Parallel searches based on type filter
        const searches: Promise<void>[] = []

        if (type === 'all' || type === 'posts') {
            searches.push(
                prisma.post.findMany({
                    where: {
                        isPublished: true,
                        OR: [
                            { title: { contains: q, mode: 'insensitive' } },
                            { content: { contains: q, mode: 'insensitive' } },
                            { tags: { hasSome: [q.toLowerCase()] } }
                        ]
                    },
                    include: {
                        author: { select: { id: true, name: true, role: true } },
                        company: { select: { id: true, name: true } },
                        _count: { select: { comments: true, reactions: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }).then(data => { results.posts = data })
            )
        }

        if (type === 'all' || type === 'people') {
            searches.push(
                prisma.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { bio: { contains: q, mode: 'insensitive' } },
                            { industry: { contains: q, mode: 'insensitive' } }
                        ]
                    },
                    select: { id: true, name: true, role: true, bio: true, isPremium: true, industry: true },
                    take: 10
                }).then(data => { results.people = data })
            )
        }

        if (type === 'all' || type === 'jobs') {
            searches.push(
                prisma.job.findMany({
                    where: {
                        OR: [
                            { title: { contains: q, mode: 'insensitive' } },
                            { company: { contains: q, mode: 'insensitive' } },
                            { description: { contains: q, mode: 'insensitive' } }
                        ]
                    },
                    select: { id: true, title: true, company: true, location: true, jobType: true },
                    take: 10
                }).then(data => { results.jobs = data })
            )
        }

        if (type === 'all' || type === 'companies') {
            searches.push(
                prisma.company.findMany({
                    where: {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { industry: { contains: q, mode: 'insensitive' } }
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        industry: true,
                        verified: true,
                        _count: { select: { followers: true } }
                    },
                    take: 10
                }).then(data => { results.companies = data })
            )
        }

        if (type === 'all' || type === 'groups') {
            searches.push(
                prisma.group.findMany({
                    where: { name: { contains: q, mode: 'insensitive' } },
                    select: { id: true, name: true, type: true },
                    take: 10
                }).then(data => { results.groups = data })
            )
        }

        if (type === 'all' || type === 'tags') {
            searches.push(
                prisma.tag.findMany({
                    where: {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { displayName: { contains: q, mode: 'insensitive' } }
                        ]
                    },
                    select: { id: true, name: true, displayName: true, postCount: true, followerCount: true },
                    orderBy: { postCount: 'desc' },
                    take: 10
                }).then(data => { results.tags = data })
            )
        }

        await Promise.all(searches)

        return NextResponse.json({
            posts: results.posts || [],
            people: results.people || [],
            jobs: results.jobs || [],
            companies: results.companies || [],
            groups: results.groups || [],
            tags: results.tags || []
        })

    } catch (error) {
        console.error('[Search API] Error:', error)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}
