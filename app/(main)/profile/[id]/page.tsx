import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { AboutSection } from '@/components/profile/AboutSection'
import { ExperienceSection } from '@/components/profile/ExperienceSection'
import { EducationSection } from '@/components/profile/EducationSection'
import { SkillsSection } from '@/components/profile/SkillsSection'
import { RecommendationsSection } from '@/components/profile/RecommendationsSection'
import styles from '../profile.module.css'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getUser(id: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                image: true,
                coverImage: true,
                isOpenToWork: true,
                openToWorkPreferences: true,
                industry: true,
                isPremium: true,
                createdAt: true,
                skills: true,
                languages: true,
                certifications: true,
                receivedEndorsements: {
                    select: {
                        skill: true,
                        endorserId: true,
                    }
                },
                receivedRecommendations: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                badges: {
                    include: {
                        badge: true
                    }
                },
                _count: {
                    select: {
                        posts: true,
                        sentConnections: true,
                        receivedConnections: true,
                    },
                },
            },
        })

        if (!user) {
            return null
        }

        return {
            ...user,
            createdAt: user.createdAt.toISOString(),
        }
    } catch (error) {
        console.error('[UserProfile] Error fetching user:', error)
        return null
    }
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params
    const user = await getUser(id)

    if (!user) {
        return {
            title: 'User Not Found | ChainVerse',
            description: 'The requested user profile could not be found.'
        }
    }

    return {
        title: `${user.name} | ChainVerse`,
        description: user.bio || `View ${user.name}'s professional profile on ChainVerse.`,
        openGraph: {
            title: `${user.name} - ChainVerse`,
            description: user.bio || `View ${user.name}'s professional profile on ChainVerse.`,
            images: [user.image || '/images/default-avatar.png'], // Fallback image needed in public folder
        }
    }
}

export default async function UserProfilePage({ params }: PageProps) {
    const { id } = await params
    const session = await getServerSession()
    const userData = await getUser(id)

    if (!userData) {
        notFound()
    }

    // Cast to any to bypass strict typing issues with complex Prisma select
    const user = userData as any;
    const isOwnProfile = session?.user?.id === user.id;

    // Format user data for ProfileHeader component
    const formattedUser = {
        id: user.id,
        name: user.name || 'Unknown User',
        role: user.bio || 'ChainVerse Member',
        about: user.bio || 'No bio available',
        location: user.industry || 'Planet Earth', // Fallback as location is missing in schema
        isPremium: user.isPremium,
        stats: {
            posts: user._count?.posts || 0,
            followers: user._count?.receivedConnections || 0, // Using connections as a proxy
            following: user._count?.sentConnections || 0,
        },
    }

    // Process skills to match SkillsSectionProps
    // Note: We need to know if the CURRENT USER has endorsed these skills.
    // Since this is a server component, we should ideally fetch that context or let the client component handle it.
    // For now, let's assume `isEndorsed` is false or we fetch "my endorsement" status if possible.
    // Actually, `receivedEndorsements` contains all endorsements. We can filter if we knew current user ID.
    // But page is public. Let's send raw skills and let logic handle it or just set count.

    // In a real scenario, we'd pass currentUserId to checking against endorserId list.
    // But getUser is mostly fetching profile user data.

    const skillsData = (user.skills || []).map((skillName: string) => {
        const endorsements = (user.receivedEndorsements || []).filter((e: any) => e.skill === skillName)
        // Check if I (session user) endorsed? We don't have session here easily without calling auth().
        // For static rendering efficiency we might skip `isEndorsed` personalization or let client fetch it.
        // Or simpler: pass `initialCount` and just let client fetch status on hover/click or if we want eager load, we need session.
        return {
            name: skillName,
            count: endorsements.length,
            isEndorsed: false // Default to false for server render, EndorsementButton can verify or we use SWR in button
        }
    })

    return (
        <div className={styles.profileContainer}>
            {/* Main Content */}
            <div className={styles.mainContent}>
                <ProfileHeader user={{ ...formattedUser, badges: user.badges }} isOwnProfile={isOwnProfile} />

                {/* Inline sidebar cards */}
                <div className={styles.profileSidebarCards}>
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>Profile Language</h3>
                        <p className={styles.sidebarText}>English</p>
                    </div>
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>Public profile & URL</h3>
                        <p className={styles.sidebarText}>
                            chainverse.com/in/{user.name?.replace(/\s+/g, '-').toLowerCase() || user.id}
                        </p>
                    </div>
                </div>

                <AboutSection about={formattedUser.about} />
                <ExperienceSection />
                <EducationSection />
                <SkillsSection
                    userId={user.id}
                    skills={skillsData}
                    isOwnProfile={isOwnProfile}
                />
                <RecommendationsSection
                    recommendations={user.receivedRecommendations}
                    userId={user.id}
                    isOwnProfile={isOwnProfile}
                />
            </div>
        </div>
    )
}
