// Test script to verify save feature functionality
// Run with: npx tsx scripts/test-save-feature.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('🧪 Testing Save Feature...\n')

        // 1. Find or create a test user
        const testUser = await prisma.user.findFirst({
            where: { email: { contains: 'test' } }
        })

        if (!testUser) {
            console.log('❌ No test user found. Please create a user first.')
            return
        }

        console.log(`✅ Found test user: ${testUser.name} (${testUser.email})`)

        // 2. Create a test post
        const testPost = await prisma.post.create({
            data: {
                title: 'Test Post for Save Feature',
                content: 'This is a test post to validate the save functionality.',
                postType: 'INSIGHT',
                tags: ['test', 'save-feature'],
                authorId: testUser.id
            }
        })

        console.log(`✅ Created test post: ${testPost.id}`)

        // 3. Save the post (create SAVE reaction)
        const saveReaction = await prisma.reaction.create({
            data: {
                type: 'SAVE',
                postId: testPost.id,
                userId: testUser.id
            }
        })

        console.log(`✅ Saved post: ${saveReaction.id}`)

        // 4. Fetch saved posts (simulating the API)
        const savedPosts = await prisma.reaction.findMany({
            where: {
                userId: testUser.id,
                type: 'SAVE'
            },
            include: {
                post: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                bio: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        console.log(`✅ Found ${savedPosts.length} saved post(s)`)
        console.log('   Post:', savedPosts[0].post.title)

        // 5. Unsave the post (delete SAVE reaction)
        await prisma.reaction.delete({
            where: { id: saveReaction.id }
        })

        console.log(`✅ Unsaved post`)

        // 6. Verify it's gone
        const remainingSaved = await prisma.reaction.findMany({
            where: {
                userId: testUser.id,
                type: 'SAVE'
            }
        })

        console.log(`✅ Remaining saved posts: ${remainingSaved.length}`)

        // Cleanup
        await prisma.post.delete({ where: { id: testPost.id } })
        console.log(`✅ Cleaned up test post`)

        console.log('\n🎉 Save feature test completed successfully!')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
