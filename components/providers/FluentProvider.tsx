'use client'

import {
    FluentProvider as FluentUIProvider,
    webLightTheme,
    Theme,
} from '@fluentui/react-components'
import { ReactNode } from 'react'

// Custom Fluent theme with ChainVerse colors
const chainVerseTheme: Theme = {
    ...webLightTheme,
}

interface FluentProviderProps {
    children: ReactNode
}

export function FluentProvider({ children }: FluentProviderProps) {
    return (
        <FluentUIProvider theme={chainVerseTheme}>
            {children}
        </FluentUIProvider>
    )
}
