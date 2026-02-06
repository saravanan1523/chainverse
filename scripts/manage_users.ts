
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const { hash } = bcrypt

const prisma = new PrismaClient()

async function manageUsers() {
    console.log('Checking for existing users...')

    // 1. List existing users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    })

    if (users.length > 0) {
        console.log('\n--- Existing Users ---')
        users.forEach(u => {
            console.log(`Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`)
        })
        console.log('----------------------')

        // Reset password for test@example.com
        const targetEmail = 'test@example.com'
        const targetUser = users.find(u => u.email === targetEmail)

        if (targetUser) {
            console.log(`\nResetting password for ${targetEmail}...`)
            const newPassword = await hash('password123', 12)
            await prisma.user.update({
                where: { email: targetEmail },
                data: { password: newPassword }
            })
            console.log(`Password reset to 'password123' for ${targetEmail}`)
        }
    } else {
        console.log('\nNo users found. Creating a test user...')

        const hashedPassword = await hash('password123', 12)

        const newUser = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@chainverse.com',
                password: hashedPassword,
                role: 'INDIVIDUAL',
                bio: 'A test user for development.',
                experienceYears: 5,
                industry: 'Logistics',
                skills: ['Supply Chain', 'Logistics']
            }
        })

        console.log('\n--- User Created ---')
        console.log(`Email: ${newUser.email}`)
        console.log('Password: password123')
        console.log('--------------------')
    }
}

manageUsers()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
