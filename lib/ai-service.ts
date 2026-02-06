import OpenAI from 'openai'
import { prisma } from './prisma'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Search posts by keywords and tags
 */
export async function searchPosts(query: string) {
    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2)

    const posts = await prisma.post.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
                { tags: { hasSome: keywords } },
            ],
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 10,
    })

    return posts
}

/**
 * Generate AI summary from search results
 */
export async function generateAISummary(question: string, posts: any[]) {
    if (!process.env.OPENAI_API_KEY) {
        return "AI assistant is not configured. Please add your OpenAI API key to the environment variables."
    }

    try {
        if (posts.length === 0) {
            // No content exists - provide best practices
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are ChainAI, an expert AI assistant for supply chain, logistics, and warehousing professionals. Provide practical insights and best practices.',
                    },
                    {
                        role: 'user',
                        content: `No existing content was found for this question: "${question}". Please provide best practices and encourage the community to share their experiences on this topic.`,
                    },
                ],
                max_tokens: 500,
            })

            return (
                completion.choices[0]?.message?.content ||
                'I could not find any related content. Please consider being the first to share your insights on this topic!'
            )
        } else {
            // Summarize existing content
            const postSummaries = posts.map((p) => ({
                title: p.title,
                type: p.postType,
                excerpt: p.content.substring(0, 200),
            }))

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are ChainAI, an expert AI assistant for supply chain, logistics, and warehousing professionals. Summarize the relevant posts to answer the user\'s question.',
                    },
                    {
                        role: 'user',
                        content: `Question: "${question}"\n\nRelated posts:\n${JSON.stringify(postSummaries, null, 2)}\n\nProvide a concise summary answering the question based on these posts.`,
                    },
                ],
                max_tokens: 500,
            })

            return (
                completion.choices[0]?.message?.content ||
                'Here are some related posts that might help with your question.'
            )
        }
    } catch (error) {
        console.error('AI generation error:', error)
        return 'An error occurred while generating the AI response. Please try again.'
    }
}

/**
 * Save AI query to database
 */
export async function saveAIQuery(userId: string, question: string, response: string) {
    return await prisma.aIQuery.create({
        data: {
            userId,
            question,
            response,
        },
    })
}

/**
 * Rewrite post content with AI to make it more professional and engaging
 */
export async function rewritePostContent(content: string) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
        // Mock implementation for development when API key is missing
        console.warn("OPENAI_API_KEY is missing. Using mock rewrite.")
        return `[Professional Refinement]: ${content}\n\n(AI Assistant successfully improved clarity and tone by streamlining your messaging for a professional supply chain audience.)`
    }

    if (!content || content.trim().length === 0) {
        throw new Error("Content cannot be empty")
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional writing assistant for supply chain, logistics, and warehousing professionals. Rewrite the given content to make it more professional, clear, and engaging while maintaining the original message and tone. Keep it concise and suitable for a professional network post.',
                },
                {
                    role: 'user',
                    content: `Please rewrite this post to make it more professional and engaging:\n\n${content}`,
                },
            ],
            max_tokens: 500,
            temperature: 0.7,
        })

        return completion.choices[0]?.message?.content || content
    } catch (error) {
        console.error('AI rewrite error:', error)
        throw new Error('Failed to rewrite content. Please try again.')
    }
}

/**
 * Generate smart replies for messaging
 */
export async function generateSmartReplies(messages: { content: string, isSender: boolean }[]) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
        // Mock suggestions for dev
        return ["Sounds good!", "I'll check and get back to you.", "Thanks for the update."]
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a smart reply assistant. Generate 3 short, professional, and contextual replies based on the conversation history. Output strictly a JSON array of strings.',
                },
                {
                    role: 'user',
                    content: `Conversation history:\n${JSON.stringify(messages)}\n\nGenerate 3 short reply options as a JSON array.`,
                },
            ],
            max_tokens: 100,
            temperature: 0.7,
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
            const parsed = JSON.parse(content)
            // Handle both { replies: [...] } and raw [...] arrays depending on how GPT structures it
            const replies = Array.isArray(parsed) ? parsed : (parsed.replies || parsed.options || [])
            return replies.slice(0, 3)
        }
        return ["Okay", "Thanks", "Can current-user reply?"]
    } catch (error) {
        console.error('Smart reply error:', error)
        return []
    }
}

/**
 * Generate specific conversation summary
 */
export async function generateConversationSummary(messages: { content: string, senderName: string }[]) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
        return "This is a mock summary of the conversation. The users discussed project timelines, agreed on the next steps, and scheduled a follow-up meeting for Friday."
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant. Summarize the following conversation into a concise paragraph (max 3 sentences). Highlight key decisions or action items.',
                },
                {
                    role: 'user',
                    content: `Conversation:\n${JSON.stringify(messages)}\n\nSummary:`,
                },
            ],
            max_tokens: 150,
            temperature: 0.5,
        })

        return completion.choices[0]?.message?.content || "Could not generate summary."
    } catch (error) {
        console.error('Summary generation error:', error)
        return "Failed to generate summary."
    }
}

