'use client'

import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
} from '@fluentui/react-components'
import { ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    footer?: ReactNode
    size?: 'small' | 'medium' | 'large'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'medium' }: ModalProps) {
    const sizeMap = {
        small: '400px',
        medium: '600px',
        large: '800px',
    }

    return (
        <Dialog open={isOpen} onOpenChange={(e, data) => !data.open && onClose()}>
            <DialogSurface style={{
                maxWidth: sizeMap[size],
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
            }}>
                <DialogBody>
                    <DialogTitle style={{ color: 'var(--color-text-primary)' }}>{title}</DialogTitle>
                    <DialogContent>{children}</DialogContent>
                    {footer && <DialogActions>{footer}</DialogActions>}
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}
