import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        const userId = session?.user?.id

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get IDs of people already connected or pending
        const existingConnections = await prisma.connection.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            }
        })

        const connectedIds = new Set<string>()
        connectedIds.add(userId) // Exclude self
        existingConnections.forEach(c => {
            connectedIds.add(c.requesterId)
            connectedIds.add(c.receiverId)
        })

        // 2. Find Users in same Industry if possible, else random
        // We need user's industry first
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { industry: true }
        })

        let suggestions = await prisma.user.findMany({
            where: {
                id: { notIn: Array.from(connectedIds) },
                industry: user?.industry || undefined
            },
            take: 3,
            select: {
                id: true,
                name: true,
                industry: true,
                role: true,
                // image is not in schema yet or removed, using name for Avatar
            }
        })

        // Fallback if not enough specific matches
        if (suggestions.length < 3) {
            const more = await prisma.user.findMany({
                where: {
                    id: { notIn: [...Array.from(connectedIds), ...suggestions.map(s => s.id)] }
                },
                take: 3 - suggestions.length,
                select: {
                    id: true,
                    name: true,
                    industry: true,
                    role: true
                }
            })
            suggestions = [...suggestions, ...more]
        }

        return NextResponse.json(suggestions)
    } catch (error) {
        console.error('Recommendation API Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
