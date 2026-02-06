import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { analyzeResume, generateInterviewQuestions, summarizeContent } from '@/lib/ai/career'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type, payload } = await request.json()

        let result = null

        switch (type) {
            case 'RESUME_ANALYSIS':
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    include: {
                        experience: true,
                        education: true,
                        certifications: true,
                    }
                })
                result = await analyzeResume(user, payload?.jobDescription)

                // Save insight if it's a general analysis
                if (!payload?.jobDescription) {
                    await prisma.careerInsight.create({
                        data: {
                            userId: session.user.id,
                            type: 'RESUME_ANALYSIS',
                            content: result as any
                        }
                    })
                }
                break

            case 'INTERVIEW_PREP':
                const candidate = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    include: { experience: true }
                })
                result = await generateInterviewQuestions(candidate, payload.jobDescription)
                break

            case 'AI_SUMMARY':
                result = await summarizeContent(payload.title, payload.content)
                break

            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('[Career AI API] Error:', error)
        return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 })
    }
}
