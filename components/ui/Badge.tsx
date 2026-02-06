'use client'

import { Badge as FluentBadge, BadgeProps } from '@fluentui/react-components'

interface CustomBadgeProps extends Omit<BadgeProps, 'color'> {
    type?: 'premium' | 'verified' | 'post-type' | 'status' | 'default'
    postType?: 'CELEBRATION' | 'INSIGHT' | 'CASE_STUDY' | 'SOP' | 'INCIDENT' | 'COMPANY_UPDATE'
    status?: string
}

export function Badge({ type = 'default', postType, status, children, ...props }: CustomBadgeProps) {
    let color: BadgeProps['color'] = 'brand'
    let appearance: BadgeProps['appearance'] = 'filled'

    if (type === 'premium') {
        color = 'important'
    } else if (type === 'verified') {
        color = 'success'
    } else if (type === 'status' && status) {
        appearance = 'tint'
        switch (status) {
            case 'APPLIED': color = 'brand'; break;
            case 'REVIEWING': color = 'warning'; break;
            case 'INTERVIEWING': color = 'important'; break;
            case 'REJECTED': color = 'danger'; break;
            case 'OFFERED': color = 'success'; break;
        }
    } else if (type === 'post-type' && postType) {
        appearance = 'tint'
        switch (postType) {
            case 'CELEBRATION':
                color = 'success'
                break
            case 'INSIGHT':
                color = 'brand'
                break
            case 'CASE_STUDY':
                color = 'informative'
                break
            case 'SOP':
                color = 'severe'
                break
            case 'INCIDENT':
                color = 'danger'
                break
            case 'COMPANY_UPDATE':
                color = 'important'
                break
        }
    }

    return (
        <FluentBadge color={color} appearance={appearance} {...props}>
            {children}
        </FluentBadge>
    )
}
