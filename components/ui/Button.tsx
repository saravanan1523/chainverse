'use client'

import {
    Button as FluentButton,
    ButtonProps as FluentButtonProps,
} from '@fluentui/react-components'
import { forwardRef, ReactNode } from 'react'

export type ButtonProps = FluentButtonProps & {
    children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        // @ts-ignore - unblock build errors due to strict prop checks
        return <FluentButton ref={ref} {...props} />
    }
)

Button.displayName = 'Button'
