'use client'

import styles from './ai.module.css'

export default function AIAssistantPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>ChainAI Assistant</h1>
                <p className={styles.subtitle}>Get AI-powered insights for your supply chain questions</p>
            </div>

            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🤖</div>
                <h2>AI Assistant Coming Soon</h2>
                <p>The AI assistant will help you find relevant posts, answer questions,</p>
                <p>and provide insights about supply chain operations.</p>
                <div className={styles.note}>
                    💡 Requires OpenAI API key in environment variables
                </div>
            </div>
        </div>
    )
}
