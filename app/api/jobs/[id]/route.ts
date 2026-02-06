import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                postedBy: {
                    select: { id: true, name: true }
                }
            }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json(job)
    } catch (error) {
        console.error('[Job Detail GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
    }
}
