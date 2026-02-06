import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                employees: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                    take: 6
                },
                jobs: {
                    where: { expiresAt: { gte: new Date() } },
                    take: 3,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        employees: true,
                        posts: true,
                        jobs: true,
                        followers: true
                    }
                }
            }
        })

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        // We also want to know if the current user is an employee? 
        // For now, client side can check if session user is in employees list or matching companyId

        return NextResponse.json(company)
    } catch (error) {
        console.error('[Company GET] Error:', error)
        return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
    }
}
