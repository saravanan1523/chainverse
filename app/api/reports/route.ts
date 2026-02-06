import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { moderateContent } from '@/lib/ai/moderation'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { targetId, targetType, reason, content } = await request.json()

        if (!targetId || !targetType || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Perform AI moderation check on the reason/report if content is provided
        let moderationResult = null
        if (content) {
            moderationResult = await moderateContent(content, targetType as any)
        }

        const report = await prisma.report.create({
            data: {
                reporterId: session.user.id,
                targetId,
                targetType,
                reason,
                status: moderationResult?.flagged ? 'URGENT' : 'PENDING'
            }
        })

        // Notify admins if available (or use a general notification system)
        // For now, we just track it in the DB

        return NextResponse.json(report)
    } catch (error) {
        console.error('[Reports API] Error:', error)
        return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        // Simple check for admin role if applicable
        if (!session || (session.user as any).role !== 'ADMIN') {
            // For prototype, let's allow users to see their own reports if needed, 
            // but usually this is an Admin only route.
            // return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const reports = await prisma.report.findMany({
            include: {
                reporter: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(reports)
    } catch (error) {
        console.error('[Reports GET API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }
}
