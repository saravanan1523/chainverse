import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const applicationSchema = z.object({
    resumeUrl: z.string().url(),
    coverLetter: z.string().optional(),
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Validate job exists
        const job = await prisma.job.findUnique({
            where: { id }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        // Check if user already applied
        const existingApp = await prisma.jobApplication.findUnique({
            where: {
                jobId_userId: {
                    jobId: id,
                    userId: session.user.id
                }
            }
        })

        if (existingApp) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 })
        }

        const body = await request.json()
        const data = applicationSchema.parse(body)

        const application = await prisma.jobApplication.create({
            data: {
                jobId: id,
                userId: session.user.id,
                resumeUrl: data.resumeUrl,
                coverLetter: data.coverLetter,
                status: 'APPLIED'
            }
        })

        // Notify job poster
        await prisma.notification.create({
            data: {
                userId: job.postedById,
                type: 'JOB_APPLICATION',
                title: 'New Job Application',
                message: `A new candidate has applied for ${job.title}`,
                link: `/jobs/manage/${id}`
            }
        })

        return NextResponse.json(application)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('[Job Apply API] Error:', error)
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }
}
