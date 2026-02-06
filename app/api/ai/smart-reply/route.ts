import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { generateSmartReplies } from "@/lib/ai-service"

export async function POST(req: Request) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { messages } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        // Generate suggestions
        const suggestions = await generateSmartReplies(messages)

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error("Smart reply API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
