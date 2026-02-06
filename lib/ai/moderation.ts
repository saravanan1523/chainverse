import OpenAI from 'openai'
import { prisma } from '../prisma'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Check content for professional standards and toxicity
 */
export async function moderateContent(content: string, type: 'POST' | 'COMMENT' | 'MESSAGE') {
    if (!process.env.OPENAI_API_KEY) {
        return { flagged: false, reason: "AI Moderation not configured" }
    }

    try {
        // Use OpenAI Moderation API for basic toxicity/safety
        const moderation = await openai.moderations.create({ input: content })
        const results = moderation.results[0]

        if (results.flagged) {
            const reasons = Object.entries(results.categories)
                .filter(([_, value]) => value)
                .map(([name, _]) => name)
            return { flagged: true, reason: `Safety Violation: ${reasons.join(', ')}` }
        }

        // Custom professional standards check using GPT-4o-mini
        const prompt = `Analyze the following ${type.toLowerCase()} for professional standards in a supply chain and logistics network. 
        It should not contain:
        1. Hate speech or harassment
        2. Blatant spam or irrelevant advertising
        3. Highly unprofessional or offensive language
        4. Explicit sexual content
        5. Misinformation about professional standards

        Content: "${content}"

        Respond ONLY in JSON format: { "flagged": boolean, "reason": string | null, "professionalScore": number (0-100) }`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'You are an expert content moderator for a professional corporate network.' }, { role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        })

        const data = JSON.parse(completion.choices[0]?.message?.content || '{}')

        // Flag if OpenAI's specialized model thinks it's unprofessional (score below 40) or flagged
        if (data.flagged || data.professionalScore < 40) {
            return { flagged: true, reason: data.reason || "Unprofessional content" }
        }

        return { flagged: false, reason: null, score: data.professionalScore }
    } catch (error) {
        console.error('Moderation error:', error)
        return { flagged: false, reason: "Error during moderation check" }
    }
}

/**
 * Handle automated action based on moderation results
 */
export async function handleAutoModeration(targetId: string, targetType: string, result: any) {
    if (result.flagged) {
        // Create an automated report
        await prisma.report.create({
            data: {
                reporterId: 'SYSTEM', // Assuming a system user exists or handle accordingly
                targetId,
                targetType,
                reason: `Auto-Moderation Flag: ${result.reason}`,
                status: 'FLAGGED'
            }
        })

        // Depending on severity, we could hides the content here
        // For now, we'll just flag it for admin review
    }
}
