import { prisma } from '@/lib/prisma'
import GroupDetailClient from './GroupDetailClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getGroup(id: string) {
    try {
        const group = await prisma.group.findUnique({
            where: { id },
            select: {
                name: true,
                description: true,
                coverImage: true,
                logo: true
            }
        })
        return group
    } catch (error) {
        return null
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const group = await getGroup(id)

    if (!group) {
        return {
            title: 'Group Not Found | ChainVerse',
            description: 'The requested group could not be found.'
        }
    }

    return {
        title: `${group.name} | ChainVerse`,
        description: group.description || `Join ${group.name} on ChainVerse.`,
        openGraph: {
            title: `${group.name} - ChainVerse Group`,
            description: group.description || `Join ${group.name} on ChainVerse.`,
            images: [group.coverImage || group.logo || '/images/default-group.png'],
        }
    }
}

export default async function GroupDetailPage({ params }: PageProps) {
    const { id } = await params

    // We can also double check existence here but Client comp handles fetch too for full data.
    // Ideally we pass initial data, but to minimize refactor risk we just render client comp.

    return <GroupDetailClient id={id} />
}
