import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { rewritePostContent } from "@/lib/ai-service"

export async function POST(req: Request) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { content } = body

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            )
        }

        const rewrittenContent = await rewritePostContent(content)

        return NextResponse.json({
            original: content,
            rewritten: rewrittenContent
        })
    } catch (error: any) {
        console.error("Error in AI rewrite API:", error)
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
