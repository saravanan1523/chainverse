import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

// POST - Vote on a poll
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: pollId } = await params
        const body = await request.json()
        const { optionId } = body

        if (!optionId) {
            return NextResponse.json({ error: 'Option ID required' }, { status: 400 })
        }

        // Check if poll exists and is not closed
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: { options: true }
        })

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
        }

        if (poll.isClosed) {
            return NextResponse.json({ error: 'Poll is closed' }, { status: 400 })
        }

        if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
        }

        // Verify option belongs to this poll
        const optionExists = poll.options.some(opt => opt.id === optionId)
        if (!optionExists) {
            return NextResponse.json({ error: 'Invalid option' }, { status: 400 })
        }

        // Check if user already voted (unless multiple votes allowed)
        if (!poll.isMultiple) {
            const existingVote = await prisma.pollVote.findFirst({
                where: {
                    userId: session.user.id,
                    option: { pollId }
                }
            })

            if (existingVote) {
                // Change vote
                await prisma.$transaction([
                    prisma.pollOption.update({
                        where: { id: existingVote.optionId },
                        data: { voteCount: { decrement: 1 } }
                    }),
                    prisma.pollVote.delete({ where: { id: existingVote.id } }),
                    prisma.pollVote.create({
                        data: { optionId, userId: session.user.id }
                    }),
                    prisma.pollOption.update({
                        where: { id: optionId },
                        data: { voteCount: { increment: 1 } }
                    })
                ])
            } else {
                // New vote
                await prisma.$transaction([
                    prisma.pollVote.create({
                        data: { optionId, userId: session.user.id }
                    }),
                    prisma.pollOption.update({
                        where: { id: optionId },
                        data: { voteCount: { increment: 1 } }
                    })
                ])
            }
        } else {
            // Multiple votes allowed - toggle vote
            const existingVote = await prisma.pollVote.findUnique({
                where: {
                    optionId_userId: { optionId, userId: session.user.id }
                }
            })

            if (existingVote) {
                await prisma.$transaction([
                    prisma.pollVote.delete({ where: { id: existingVote.id } }),
                    prisma.pollOption.update({
                        where: { id: optionId },
                        data: { voteCount: { decrement: 1 } }
                    })
                ])
            } else {
                await prisma.$transaction([
                    prisma.pollVote.create({
                        data: { optionId, userId: session.user.id }
                    }),
                    prisma.pollOption.update({
                        where: { id: optionId },
                        data: { voteCount: { increment: 1 } }
                    })
                ])
            }
        }

        // Return updated poll
        const updatedPoll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    select: { id: true, text: true, voteCount: true }
                }
            }
        })

        return NextResponse.json(updatedPoll)

    } catch (error) {
        console.error('[Poll Vote API] Error:', error)
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
    }
}

// GET - Get poll details with user's vote
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession()
        const { id: pollId } = await params

        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                group: { select: { id: true, name: true } },
                options: {
                    select: { id: true, text: true, voteCount: true }
                }
            }
        })

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
        }

        let userVotes: string[] = []
        if (session?.user?.id) {
            const votes = await prisma.pollVote.findMany({
                where: {
                    userId: session.user.id,
                    option: { pollId }
                },
                select: { optionId: true }
            })
            userVotes = votes.map(v => v.optionId)
        }

        return NextResponse.json({ ...poll, userVotes })

    } catch (error) {
        console.error('[Poll API] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 })
    }
}
