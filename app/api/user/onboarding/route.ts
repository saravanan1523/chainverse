import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { role, industry, bio } = body

        // Update user profile
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                // Map 'role' from UI to something appropriate. Schema has `role: UserRole` enum which is restrictive (INDIVIDUAL, etc)
                // BUT it also has `bio` and `industry`.
                // Ideally we should have a `title` or `headline` field. `bio` is close enough for now.
                // We'll put role in bio if it's empty, or ideally specific field.
                // Let's use `bio` for the Role title "Supply Chain Manager" for now since we don't have a specific Title field on User model top level
                // (except in Experience).
                // Actually `User` model has `industry` string.
                industry,
                bio: bio || role // Simple mapping
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Onboarding error:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
