import { getServerSession as nextAuthGetServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

/**
 * Wrapper around next-auth's getServerSession
 */
export async function getServerSession() {
    return await nextAuthGetServerSession(authOptions)
}

/**
 * Require authentication for a server component
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
    const session = await getServerSession()

    if (!session || !session.user) {
        redirect('/login')
    }

    return session
}

/**
 * Require specific role for access
 */
export async function requireRole(allowedRoles: string[]) {
    const session = await requireAuth()

    if (!allowedRoles.includes(session.user.role)) {
        redirect('/')
    }

    return session
}
