import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const statusSchema = z.object({
    status: z.enum(['APPLIED', 'REVIEWING', 'INTERVIEWING', 'REJECTED', 'OFFERED']),
    notes: z.string().optional(),
})

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const data = statusSchema.parse(body)

        // Verify that the current user is the poster of the job
        const application = await prisma.jobApplication.findUnique({
            where: { id },
            include: { job: true }
        })

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 })
        }

        if (application.job.postedById !== session.user.id) {
            return NextResponse.json({ error: 'Only the job poster can update application status' }, { status: 403 })
        }

        const updatedApplication = await prisma.jobApplication.update({
            where: { id },
            data: {
                status: data.status,
                notes: data.notes
            }
        })

        // Notify candidate
        await prisma.notification.create({
            data: {
                userId: application.userId,
                type: 'APPLICATION_UPDATE',
                title: 'Application Update',
                message: `The status of your application for ${application.job.title} has been updated to ${data.status}`,
                link: `/applications`
            }
        })

        return NextResponse.json(updatedApplication)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('[Application Status API] Error:', error)
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }
}
