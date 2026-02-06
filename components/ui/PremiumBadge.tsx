import { Star24Filled } from '@fluentui/react-icons'

export function PremiumBadge({ size = 16 }: { size?: number }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(45deg, #f1c40f, #f39c12)',
                borderRadius: '50%',
                width: size + 8,
                height: size + 8,
                marginLeft: 6,
                boxShadow: '0 0 10px rgba(241, 196, 15, 0.4)'
            }}
            title="Premium Member"
        >
            <Star24Filled style={{ width: size, height: size, color: '#fff' }} />
        </div>
    )
}
