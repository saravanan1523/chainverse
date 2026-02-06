import OpenAI from 'openai'
import { prisma } from '../prisma'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Analyze a user's resume/profile against a job description or industry standards
 */
export async function analyzeResume(profileData: any, jobDescription?: string) {
    if (!process.env.OPENAI_API_KEY) {
        return {
            score: 0,
            feedback: "AI service not configured.",
            missingSkills: [],
            suggestions: ["Add your OpenAI API key to enable analysis."]
        }
    }

    try {
        const prompt = jobDescription
            ? `Compare this user profile to this job description:\n\nProfile: ${JSON.stringify(profileData)}\n\nJob Description: ${jobDescription}\n\nProvide a match score (0-100), detailed feedback, a list of missing skills, and 3 actionable suggestions to improve the resume for this specific role. Return JSON format: { "score": number, "feedback": string, "missingSkills": string[], "suggestions": string[] }`
            : `Analyze this user profile for general industry standards in their field:\n\nProfile: ${JSON.stringify(profileData)}\n\nProvide an optimization score (0-100), feedback on their professional summary and experience, a list of recommended skills to add, and 3 actionable suggestions. Return JSON format: { "score": number, "feedback": string, "missingSkills": string[], "suggestions": string[] }`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional career coach and recruiter specializing in supply chain, logistics, and warehousing. Your goal is to help users optimize their profiles for career advancement.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000,
        })

        const content = completion.choices[0]?.message?.content
        return content ? JSON.parse(content) : null
    } catch (error) {
        console.error('Resume analysis error:', error)
        throw new Error('Failed to analyze resume.')
    }
}

/**
 * Generate mock interview questions based on job description and user profile
 */
export async function generateInterviewQuestions(profileData: any, jobDescription: string) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a hiring manager for a top supply chain firm. Generate 5 relevant and challenging interview questions for a candidate based on their profile and the job description.',
                },
                {
                    role: 'user',
                    content: `Job Description: ${jobDescription}\n\nCandidate Profile: ${JSON.stringify(profileData)}\n\nGenerate 5 specific questions. Return JSON format: { "questions": string[] }`,
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 500,
        })

        const content = completion.choices[0]?.message?.content
        return content ? JSON.parse(content) : { questions: [] }
    } catch (error) {
        console.error('Interview generation error:', error)
        return { questions: [] }
    }
}

/**
 * Summarize a post or newsletter edition using AI
 */
export async function summarizeContent(title: string, content: string) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that provides concise, high-value summaries of professional articles and newsletters for supply chain professionals.',
                },
                {
                    role: 'user',
                    content: `Title: ${title}\n\nContent: ${content}\n\nProvide a 3-bullet point summary highlight the key takeaways. Return JSON format: { "summary": string[] }`,
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
        })

        const data = completion.choices[0]?.message?.content
        return data ? JSON.parse(data) : { summary: [] }
    } catch (error) {
        console.error('Summarization error:', error)
        return { summary: [] }
    }
}
