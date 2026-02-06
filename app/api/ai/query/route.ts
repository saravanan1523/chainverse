import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { searchPosts, generateAISummary, saveAIQuery } from "@/lib/ai-service"

export async function POST(req: Request) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { question } = body

        if (!question || question.trim().length === 0) {
            return NextResponse.json(
                { error: "Question is required" },
                { status: 400 }
            )
        }

        // Search for related posts
        const relatedPosts = await searchPosts(question)

        // Generate AI summary
        const aiResponse = await generateAISummary(question, relatedPosts)

        // Save query to database
        await saveAIQuery(session.user.id, question, aiResponse)

        return NextResponse.json({
            question,
            response: aiResponse,
            relatedPosts: relatedPosts.map((p) => ({
                id: p.id,
                title: p.title,
                postType: p.postType,
                author: p.author?.name,
                company: p.company?.name,
                createdAt: p.createdAt,
            })),
        })
    } catch (error) {
        console.error("Error processing AI query:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
