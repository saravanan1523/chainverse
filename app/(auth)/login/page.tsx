'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Input,
    Label,
    Field,
} from '@fluentui/react-components'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Invalid email or password')
            } else {
                router.push('/')
                router.refresh()
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

                <h2>Sign In</h2>
                <p className={styles.subtitle}>Welcome back! Please sign in to continue.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Field label="Email" required>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            size="large"
                            required
                        />
                    </Field>

                    <Field label="Password" required>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            size="large"
                            required
                        />
                    </Field>

                    {error && <div className={styles.error}>{error}</div>}

                    <Button
                        appearance="primary"
                        size="large"
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div className={styles.divider}>
                        <span>Don't have an account?</span>
                    </div>

                    <Link href="/register">
                        <Button appearance="subtle" size="large" style={{ width: '100%' }}>
                            Create Account
                        </Button>
                    </Link>
                </form>
            </div>
        </div>
    )
}
