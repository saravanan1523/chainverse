import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const companyCreateSchema = z.object({
    name: z.string().min(2),
    industry: z.string().optional(),
    description: z.string().optional(),
    locations: z.array(z.string()).optional(),
})

// GET - List all companies
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search')

        const companies = await prisma.company.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { industry: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : undefined,
            include: {
                _count: {
                    select: {
                        employees: true,
                        posts: true,
                    },
                },
            },
            orderBy: {
                verified: 'desc',
            },
            take: 50,
        })

        return NextResponse.json(companies)
    } catch (error) {
        console.error("Error fetching companies:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Create a new company
export async function POST(req: Request) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Only company admins can create companies
        if (session.user.role !== 'COMPANY_ADMIN') {
            return NextResponse.json(
                { error: "Only company admins can create companies" },
                { status: 403 }
            )
        }

        const body = await req.json()
        const data = companyCreateSchema.parse(body)

        // Check if company name already exists
        const existingCompany = await prisma.company.findUnique({
            where: { name: data.name },
        })

        if (existingCompany) {
            return NextResponse.json(
                { error: "Company with this name already exists" },
                { status: 400 }
            )
        }

        const company = await prisma.company.create({
            data: {
                name: data.name,
                industry: data.industry,
                description: data.description,
                locations: data.locations || [],
            },
        })

        // Associate the admin with the company
        await prisma.user.update({
            where: { id: session.user.id },
            data: { companyId: company.id },
        })

        return NextResponse.json(company, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            )
        }

        console.error("Error creating company:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
