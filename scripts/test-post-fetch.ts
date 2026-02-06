import { prisma } from '../lib/prisma'

async function testPostFetch() {
    console.log('Testing post fetch...')

    // Get all posts
    const posts = await prisma.post.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            createdAt: true,
        },
    })

    console.log('Found posts:', posts.length)
    posts.forEach(post => {
        console.log(`- ID: ${post.id}, Title: ${post.title}`)
    })

    if (posts.length > 0) {
        const testId = posts[0].id
        console.log(`\nTesting fetch for ID: ${testId}`)

        const post = await prisma.post.findUnique({
            where: { id: testId },
            include: {
                author: true,
                _count: {
                    select: {
                        reactions: true,
                        comments: true,
                    },
                },
            },
        })

        console.log('Fetched post:', post ? 'SUCCESS' : 'FAILED')
        if (post) {
            console.log('Post title:', post.title)
            console.log('Author:', post.author?.name)
        }
    }

    await prisma.$disconnect()
}

testPostFetch().catch(console.error)
