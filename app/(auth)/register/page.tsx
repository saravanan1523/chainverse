'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Input,
    Label,
    Field,
    Select,
    Textarea,
} from '@fluentui/react-components'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'INDIVIDUAL',
        bio: '',
        experienceYears: '',
        industry: '',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Registration failed')
            } else {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1>ChainVerse</h1>
                    <p>Supply Chain Professional Network</p>
                </div>

                <h2>Create Account</h2>
                <p className={styles.subtitle}>Join the supply chain community</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Field label="Full Name" required>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="John Doe"
                            size="large"
                            required
                        />
                    </Field>

                    <Field label="Email" required>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="your@email.com"
                            size="large"
                            required
                        />
                    </Field>

                    <Field label="Password" required>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="At least 6 characters"
                            size="large"
                            required
                        />
                    </Field>

                    <Field label="Role" required>
                        <Select
                            value={formData.role}
                            onChange={(e, data) => handleChange('role', data.value)}
                            size="large"
                        >
                            <option value="INDIVIDUAL">Individual Professional</option>
                            <option value="COMPANY_ADMIN">Company Admin</option>
                            <option value="COMPANY_EMPLOYEE">Company Employee</option>
                        </Select>
                    </Field>

                    <Field label="Industry">
                        <Input
                            type="text"
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                            placeholder="e.g., Logistics, Warehousing"
                            size="large"
                        />
                    </Field>

                    <Field label="Years of Experience">
                        <Input
                            type="number"
                            value={formData.experienceYears}
                            onChange={(e) => handleChange('experienceYears', e.target.value)}
                            placeholder="e.g., 5"
                            size="large"
                        />
                    </Field>

                    <Field label="Bio">
                        <Textarea
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                        />
                    </Field>

                    {error && <div className={styles.error}>{error}</div>}
                    {success && (
                        <div className={styles.success}>
                            Account created successfully! Redirecting to login...
                        </div>
                    )}

                    <Button
                        appearance="primary"
                        size="large"
                        type="submit"
                        disabled={loading || success}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    <div className={styles.divider}>
                        <span>Already have an account?</span>
                    </div>

                    <Link href="/login">
                        <Button appearance="subtle" size="large" style={{ width: '100%' }}>
                            Sign In
                        </Button>
                    </Link>
                </form>
            </div>
        </div>
    )
}
