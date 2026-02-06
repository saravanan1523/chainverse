import { prisma } from './prisma'

/**
 * Predefined badges and their requirements
 */
export const BADGES = [
    {
        name: 'Thought Leader',
        description: 'Awarded for sharing high-impact insights and receiving 50+ reactions.',
        icon: 'Sparkle24Filled',
        type: 'EXPERTISE',
        requirements: { reactions: 50, posts: 10 }
    },
    {
        name: 'Rising Star',
        description: 'New member who has completed their profile and shared their first 3 posts.',
        icon: 'Star24Filled',
        type: 'MILESTONE',
        requirements: { posts: 3, profileComplete: true }
    },
    {
        name: 'Community Pillar',
        description: 'Actively participating and helping others through endorsements and comments.',
        icon: 'People24Filled',
        type: 'COMMUNITY',
        requirements: { comments: 20, endorsementsGiven: 10 }
    },
    {
        name: 'Supply Chain Master',
        description: 'Received 10+ professional recommendations in the network.',
        icon: 'Certificate24Filled',
        type: 'EXPERTISE',
        requirements: { recommendations: 10 }
    }
]

/**
 * Check if a user qualifies for a badge after an action
 */
export async function checkAndAwardBadges(userId: string) {
    try {
        // Fetch user stats
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                        reactions: true,
                        receivedConnections: true,
                        givenEndorsements: true,
                        receivedEndorsements: true,
                        receivedRecommendations: true
                    }
                },
                badges: true
            }
        })

        if (!user) return

        const u = user as any
        const p = prisma as any

        for (const badgeData of BADGES) {
            // Find or create the badge in DB
            const dbBadge = await p.badge.upsert({
                where: { name: badgeData.name },
                update: {},
                create: {
                    name: badgeData.name,
                    description: badgeData.description,
                    icon: badgeData.icon,
                    type: badgeData.type
                }
            })

            // Check if user already has it
            const hasBadge = u.badges.some((ub: any) => ub.badgeId === dbBadge.id)
            if (hasBadge) continue

            // Check requirements
            let qualified = false
            const stats = u._count

            if (badgeData.name === 'Thought Leader' && stats.reactions >= 50 && stats.posts >= 10) qualified = true
            if (badgeData.name === 'Rising Star' && stats.posts >= 3) qualified = true
            if (badgeData.name === 'Community Pillar' && stats.comments >= 20 && stats.givenEndorsements >= 10) qualified = true
            if (badgeData.name === 'Supply Chain Master' && stats.receivedRecommendations >= 10) qualified = true

            if (qualified) {
                await prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId: dbBadge.id,
                        level: 'BRONZE' // Default starting level
                    }
                })

                // Create a notification
                await prisma.notification.create({
                    data: {
                        userId,
                        type: 'BADGE_EARNED',
                        title: 'New Badge Earned! 🏆',
                        message: `Congratulations! You've earned the "${badgeData.name}" badge.`,
                        link: `/profile/${userId}`
                    }
                })
            }
        }
    } catch (error) {
        console.error('Achievement Engine Error:', error)
    }
}
