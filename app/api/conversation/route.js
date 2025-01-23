import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'conversation.txt')
    const data = await fs.readFile(filePath, 'utf8')
    return NextResponse.json({ content: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load conversation' }, { status: 500 })
  }
}