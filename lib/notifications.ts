import { prisma } from './prisma'

export async function createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
            },
        })

        // Emit live notification if socket is available
        if ((global as any).io) {
            (global as any).io.to(userId).emit('new_notification', notification)
        }

        return notification
    } catch (error) {
        console.error('[NotificationLib] Error creating notification:', error)
        return null
    }
}

export async function notifyNewsletterSubscribers(newsletterId: string, postId: string) {
    try {
        const newsletter = await prisma.newsletter.findUnique({
            where: { id: newsletterId },
            include: {
                subscribers: {
                    include: { user: true }
                },
                owner: true
            }
        })

        if (!newsletter) return

        const post = await prisma.post.findUnique({
            where: { id: postId }
        })

        if (!post) return

        const notifications = newsletter.subscribers.map(sub => ({
            userId: sub.userId,
            type: 'NEWSLETTER_UPDATE',
            title: `New Edition: ${newsletter.title}`,
            message: `${newsletter.owner.name} published a new edition: ${post.title}`,
            link: `/post/${postId}`
        }))

        // Create in-app notifications in bulk
        await prisma.notification.createMany({
            data: notifications
        })

        // Mock Email Delivery Logging
        console.log(`[Email Service] Sent newsletter emails for "${newsletter.title}" to ${newsletter.subscribers.length} subscribers.`)

    } catch (error) {
        console.error('[NotificationLib] Error notifying newsletter subscribers:', error)
    }
}
