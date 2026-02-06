'use client'

import { useState } from 'react'
import { Checkmark24Filled } from '@fluentui/react-icons'
import { Button } from '@fluentui/react-components'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from './pricing.module.css'

export default function PricingPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isUpgrading, setIsUpgrading] = useState(false)

    const handleUpgrade = async () => {
        if (!session) {
            router.push('/login')
            return
        }

        setIsUpgrading(true)
        try {
            const res = await fetch('/api/user/upgrade', {
                method: 'POST'
            })
            if (res.ok) {
                // Force session update usually requires reload or trickery, for now we just reload
                window.location.href = '/'
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsUpgrading(false)
        }
    }

    const currentPlan = session?.user?.isPremium ? 'PRO' : 'FREE'

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Unlock Professional Powers</h1>
                <p className={styles.subtitle}>Supercharge your supply chain career with Premium.</p>
            </div>

            <div className={styles.grid}>
                {/* Free Plan */}
                <div className={styles.card}>
                    <h3 className={styles.planName}>Basic</h3>
                    <div className={styles.price}>
                        $0<span className={styles.period}>/mo</span>
                    </div>

                    <ul className={styles.features}>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            Professional Profile
                        </li>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            Join Public Groups
                        </li>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            Apply to Jobs
                        </li>
                    </ul>

                    <Button
                        appearance="outline"
                        size="large"
                        className={styles.button}
                        disabled={currentPlan === 'PRO' || currentPlan === 'FREE'}
                    >
                        {currentPlan === 'FREE' ? 'Current Plan' : 'Downgrade'}
                    </Button>
                </div>

                {/* Pro Plan */}
                <div className={`${styles.card} ${styles.popular}`}>
                    <div className={styles.badge}>Recommended</div>
                    <h3 className={styles.planName}>Premium</h3>
                    <div className={styles.price}>
                        $19<span className={styles.period}>/mo</span>
                    </div>

                    <ul className={styles.features}>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            All Basic Features
                        </li>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            Who Viewed Your Profile
                        </li>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            Direct Messaging (Unlimited)
                        </li>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            Advanced Analytics
                        </li>
                        <li className={styles.feature}>
                            <Checkmark24Filled className={styles.check} />
                            Verified Badge
                        </li>
                    </ul>

                    <Button
                        appearance="primary"
                        size="large"
                        className={styles.button}
                        onClick={handleUpgrade}
                        disabled={isUpgrading || currentPlan === 'PRO'}
                    >
                        {currentPlan === 'PRO' ? 'Active Plan' : isUpgrading ? 'Processing...' : 'Upgrade Now'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
