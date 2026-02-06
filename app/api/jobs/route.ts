import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const jobCreateSchema = z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    location: z.string().min(1),
    locationType: z.string(), // Remote, On-site, Hybrid
    jobType: z.string(), // Full-time, Contract, etc.
    description: z.string().min(10),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    tags: z.array(z.string()).default([]),
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')
        const location = searchParams.get('location')
        const type = searchParams.get('type')
        const jobType = searchParams.get('jobType')

        const whereClause: any = {}

        if (q) {
            whereClause.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { company: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ]
        }

        if (location) {
            whereClause.location = { contains: location, mode: 'insensitive' }
        }

        if (type) {
            whereClause.locationType = type
        }

        if (jobType) {
            whereClause.jobType = jobType
        }

        const jobs = await prisma.job.findMany({
            where: whereClause,
            include: {
                postedBy: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(jobs)
    } catch (error) {
        console.error('[Jobs GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = jobCreateSchema.parse(body)

        const job = await prisma.job.create({
            data: {
                ...data,
                postedById: session.user.id
            }
        })

        return NextResponse.json(job)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
        }
        console.error('[Jobs POST] Error:', error)
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }
}
