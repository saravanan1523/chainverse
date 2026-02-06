import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateConversationSummary } from "@/lib/ai-service"

export async function POST(req: Request) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { conversationId } = await req.json()

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
        }

        // Fetch last 50 messages
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 50,
            include: {
                sender: {
                    select: { name: true }
                }
            }
        })

        if (messages.length === 0) {
            return NextResponse.json({ summary: "No messages to summarize." })
        }

        const formattedMessages = messages.map(m => ({
            senderName: m.sender.name,
            content: m.content
        }))

        const summary = await generateConversationSummary(formattedMessages)

        return NextResponse.json({ summary })
    } catch (error) {
        console.error("Conversation summary API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
