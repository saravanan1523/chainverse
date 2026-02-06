import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['INDIVIDUAL', 'COMPANY_ADMIN', 'COMPANY_EMPLOYEE']),
    bio: z.string().optional(),
    experienceYears: z.number().optional(),
    skills: z.array(z.string()).optional(),
    industry: z.string().optional(),
    companyId: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const data = registerSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hash(data.password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                bio: data.bio,
                experienceYears: data.experienceYears,
                skills: data.skills || [],
                industry: data.industry,
                companyId: data.companyId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        })

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            )
        }

        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
