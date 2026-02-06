'use client'

import { ModerationQueue } from '@/components/admin/ModerationQueue'

export default function AdminModerationPage() {
    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Monitor platform safety and professional standards</p>

            <ModerationQueue />
        </div>
    )
}
