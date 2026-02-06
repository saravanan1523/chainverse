'use client'

import {
    Avatar as FluentAvatar,
    Badge,
} from '@fluentui/react-components'
import { CheckmarkCircle20Filled, Premium20Filled } from '@fluentui/react-icons'

interface AvatarProps {
    name: string
    size?: number | 'small' | 'medium' | 'large' | 'extra-large'
    image?: string
    isPremium?: boolean
    isVerified?: boolean
}

export function Avatar({ name, size = 'medium', image, isPremium, isVerified }: AvatarProps) {
    const sizeMap = {
        small: 24,
        medium: 32,
        large: 48,
        'extra-large': 64,
    }

    const avatarSize = typeof size === 'string' ? sizeMap[size] : size

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <FluentAvatar
                name={name}
                image={image ? { src: image } : undefined}
                size={avatarSize as any}
            />
            {(isPremium || isVerified) && (
                <Badge
                    size="small"
                    appearance="filled"
                    color={isVerified ? 'success' : 'brand'}
                    icon={isVerified ? <CheckmarkCircle20Filled /> : <Premium20Filled />}
                    style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                    }}
                />
            )}
        </div>
    )
}
