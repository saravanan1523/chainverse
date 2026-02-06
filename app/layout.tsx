import { ReactNode } from 'react'
import './globals.css'
import { FluentProvider } from '@/components/providers/FluentProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { MessagingProvider } from '@/context/MessagingContext'
import { ThemeProvider } from '@/context/ThemeContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChainVerse - Supply Chain Professional Network',
  description: 'A unified professional and knowledge platform for supply chain, logistics, and warehousing professionals',
  keywords: ['supply chain', 'logistics', 'warehousing', 'professional network', 'knowledge sharing'],
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <FluentProvider>
              <MessagingProvider>
                {children}
              </MessagingProvider>
            </FluentProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
