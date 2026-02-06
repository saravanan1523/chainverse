import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { bio, industry, image, coverImage, isOpenToWork, openToWorkPreferences } = data

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                bio,
                industry,
                image,
                coverImage,
                isOpenToWork,
                openToWorkPreferences: openToWorkPreferences as any
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('[Profile API] Error updating profile:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
