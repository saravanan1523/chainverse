import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        try {
            await mkdir(uploadsDir, { recursive: true })
        } catch (error) {
            // Ignore if already exists
        }

        // Generate unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        const filepath = join(uploadsDir, filename)

        // Write file
        await writeFile(filepath, buffer)

        // Return public URL
        const url = `/uploads/${filename}`

        // Determine detailed type
        let detailedType = type
        if (file.type) detailedType = file.type

        return NextResponse.json({ url, type: detailedType })
    } catch (error) {
        console.error('[Upload] Error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
