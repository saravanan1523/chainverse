import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const user = await prisma.user.findUnique({
            where: { id: id },
            include: {
                company: true,
                experience: {
                    orderBy: { startDate: 'desc' }
                },
                education: {
                    orderBy: { startDate: 'desc' }
                },
                receivedEndorsements: {
                    include: {
                        endorser: {
                            select: {
                                id: true,
                                name: true,
                                industry: true
                            }
                        }
                    }
                },
                receivedRecommendations: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                industry: true,
                                company: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                        receivedConnections: true,

                        sentConnections: true
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Calculate connection count (approximate or precise based on status)
        // For accurate count of accepted connections:
        const connectionCount = await prisma.connection.count({
            where: {
                OR: [
                    { requesterId: id, status: 'ACCEPTED' },
                    { receiverId: id, status: 'ACCEPTED' }
                ]
            }
        })

        // Transform endorsements to group by skill
        const skillsWithEndorsements = user.skills.map(skill => {
            const endorsements = user.receivedEndorsements.filter(e => e.skill === skill)
            return {
                name: skill,
                count: endorsements.length,
                endorsedBy: endorsements.map(e => e.endorser)
            }
        })

        // Remove password and mix in new data
        const { password, ...userWithoutPassword } = user
        const responseData = {
            ...userWithoutPassword,
            skills: skillsWithEndorsements,
            connectionCount
        }

        return NextResponse.json(responseData)

        return NextResponse.json(userWithoutPassword)
    } catch (error) {
        console.error("Error fetching user:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const session = await getServerSession()

        if (!session || session.user.id !== id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, bio, experienceYears, skills, industry } = body

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(bio !== undefined && { bio }),
                ...(experienceYears !== undefined && { experienceYears }),
                ...(skills && { skills }),
                ...(industry && { industry }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                bio: true,
                experienceYears: true,
                skills: true,
                industry: true,
                isPremium: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
