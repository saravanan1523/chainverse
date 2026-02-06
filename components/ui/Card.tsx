'use client'

import {
    Card as FluentCard,
    CardHeader,
    CardPreview,
} from '@fluentui/react-components'
import { ReactNode, CSSProperties } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    style?: CSSProperties
    onClick?: () => void
}

export function Card({ children, className = '', style, onClick }: CardProps) {
    return (
        <FluentCard
            className={className}
            style={{
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--space-lg)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-primary)',
                ...style
            }}
            onClick={onClick}
        >
            {children}
        </FluentCard>
    )
}

export { CardHeader, CardPreview }
