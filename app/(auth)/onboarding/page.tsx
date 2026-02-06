'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@fluentui/react-components'
import { ArrowRight24Regular } from '@fluentui/react-icons'

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        role: '',
        industry: '',
        bio: ''
    })
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            router.push('/')
        } catch (error) {
            console.error('Failed to save onboarding data', error)
            setIsSaving(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
            <div style={{ width: '100%', maxWidth: '480px', padding: '32px', background: '#161b22', borderRadius: '12px', border: '1px solid #30363d' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Welcome to ChainVerse</h1>
                    <p style={{ color: '#8b949e' }}>Let's set up your professional profile.</p>
                </div>

                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px' }}>What best describes your role?</h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {['Supply Chain Manager', 'Logistics Coordinator', 'Procurement Specialist', 'Warehouse Operations', 'Student', 'Other'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setFormData({ ...formData, role })}
                                    style={{
                                        padding: '16px',
                                        background: formData.role === role ? '#1f6feb' : '#21262d',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                            <Button
                                appearance="primary"
                                disabled={!formData.role}
                                onClick={() => setStep(2)}
                                icon={<ArrowRight24Regular />}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px' }}>Which industry are you in?</h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {['Retail & E-commerce', 'Manufacturing', 'Transportation & Logistics', 'Healthcare', 'Technology', 'Automotive'].map(ind => (
                                <button
                                    key={ind}
                                    onClick={() => setFormData({ ...formData, industry: ind })}
                                    style={{
                                        padding: '16px',
                                        background: formData.industry === ind ? '#1f6feb' : '#21262d',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {ind}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                            <Button appearance="subtle" onClick={() => setStep(1)}>Back</Button>
                            <Button
                                appearance="primary"
                                disabled={!formData.industry || isSaving}
                                onClick={handleSave}
                                icon={<ArrowRight24Regular />}
                            >
                                {isSaving ? 'Finishing...' : 'Complete Setup'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
