import { ReactNode } from 'react'

export default function MessagingLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
            {children}
        </div>
    )
}
