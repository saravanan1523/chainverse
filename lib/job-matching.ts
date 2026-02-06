/**
 * Job Matching Algorithm
 * Scores jobs based on how well a user's skills match the job requirements
 */

export interface MatchResult {
    score: number // 0-100
    matchedSkills: string[]
    missingSkills: string[]
    totalRequirements: number
}

/**
 * Calculate match score between user skills and job requirements
 * @param userSkills - Array of user's skills
 * @param jobRequirements - Array of job requirements/skills
 * @returns MatchResult with score and skill breakdown
 */
export function calculateJobMatch(
    userSkills: string[],
    jobRequirements: string[]
): MatchResult {
    if (!jobRequirements || jobRequirements.length === 0) {
        return {
            score: 0,
            matchedSkills: [],
            missingSkills: [],
            totalRequirements: 0
        }
    }

    // Normalize skills for comparison (lowercase, trim)
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim())
    const normalizedJobReqs = jobRequirements.map(r => r.toLowerCase().trim())

    // Find matched and missing skills
    const matchedSkills: string[] = []
    const missingSkills: string[] = []

    jobRequirements.forEach((req, index) => {
        const normalizedReq = normalizedJobReqs[index]

        // Check for exact match or partial match (contains)
        const hasMatch = normalizedUserSkills.some(skill =>
            skill === normalizedReq ||
            skill.includes(normalizedReq) ||
            normalizedReq.includes(skill)
        )

        if (hasMatch) {
            matchedSkills.push(req)
        } else {
            missingSkills.push(req)
        }
    })

    // Calculate score as percentage of matched requirements
    const score = Math.round((matchedSkills.length / jobRequirements.length) * 100)

    return {
        score,
        matchedSkills,
        missingSkills,
        totalRequirements: jobRequirements.length
    }
}

/**
 * Sort jobs by match score (highest first)
 */
export function sortJobsByMatch(
    jobs: any[],
    userSkills: string[]
): Array<any & { matchScore: number, matchDetails: MatchResult }> {
    const jobsWithScores = jobs.map(job => {
        const matchDetails = calculateJobMatch(userSkills, job.requirements || [])
        return {
            ...job,
            matchScore: matchDetails.score,
            matchDetails
        }
    })

    return jobsWithScores.sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Get top recommended jobs (score >= 30%)
 */
export function getRecommendedJobs(
    jobs: any[],
    userSkills: string[],
    limit = 5
): Array<any & { matchScore: number, matchDetails: MatchResult }> {
    const sorted = sortJobsByMatch(jobs, userSkills)
    return sorted.filter(job => job.matchScore >= 30).slice(0, limit)
}
