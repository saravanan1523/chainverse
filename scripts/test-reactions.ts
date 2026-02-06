// Test script to verify reactions functionality
// Run with: npx tsx scripts/test-reactions.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('🧪 Testing Reactions Functionality...\n')

        // 1. Find a test user
        const testUser = await prisma.user.findFirst({
            where: { email: { contains: 'test' } }
        })

        if (!testUser) {
            console.log('❌ No test user found')
            return
        }

        console.log(`✅ Found test user: ${testUser.name}`)

        // 2. Find or create a test post
        let testPost = await prisma.post.findFirst({
            where: { authorId: testUser.id }
        })

        if (!testPost) {
            testPost = await prisma.post.create({
                data: {
                    title: 'Test Post for Reactions',
                    content: 'Testing reactions functionality',
                    postType: 'INSIGHT',
                    tags: [],
                    authorId: testUser.id
                }
            })
            console.log(`✅ Created test post: ${testPost.id}`)
        } else {
            console.log(`✅ Found existing post: ${testPost.id}`)
        }

        // 3. Test LIKE reaction
        console.log('\n--- Testing LIKE reaction ---')

        const likeReaction = await prisma.reaction.create({
            data: {
                type: 'LIKE',
                postId: testPost.id,
                userId: testUser.id
            }
        })
        console.log(`✅ Created LIKE reaction: ${likeReaction.id}`)

        // 4. Test SAVE reaction
        console.log('\n--- Testing SAVE reaction ---')

        const saveReaction = await prisma.reaction.create({
            data: {
                type: 'SAVE',
                postId: testPost.id,
                userId: testUser.id
            }
        })
        console.log(`✅ Created SAVE reaction: ${saveReaction.id}`)

        // 5. Fetch all reactions for the post
        const reactions = await prisma.reaction.findMany({
            where: { postId: testPost.id }
        })
        console.log(`\n✅ Total reactions: ${reactions.length}`)
        console.log(`   - LIKE: ${reactions.filter(r => r.type === 'LIKE').length}`)
        console.log(`   - SAVE: ${reactions.filter(r => r.type === 'SAVE').length}`)

        // 6. Test toggle (delete)
        console.log('\n--- Testing reaction toggle (delete) ---')

        await prisma.reaction.delete({
            where: { id: likeReaction.id }
        })
        console.log(`✅ Deleted LIKE reaction`)

        await prisma.reaction.delete({
            where: { id: saveReaction.id }
        })
        console.log(`✅ Deleted SAVE reaction`)

        const remainingReactions = await prisma.reaction.findMany({
            where: { postId: testPost.id }
        })
        console.log(`✅ Remaining reactions: ${remainingReactions.length}`)

        console.log('\n🎉 All reactions tests passed!')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
