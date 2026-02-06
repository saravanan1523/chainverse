'use client'

import { useState } from 'react'
import {
    Button,
} from '@fluentui/react-components'
import { Add24Regular, Delete24Regular, Dismiss24Regular } from '@fluentui/react-icons'
import styles from './createPollModal.module.css'

interface CreatePollModalProps {
    isOpen: boolean
    onClose: () => void
    groupId: string
    onPollCreated?: () => void
}

export function CreatePollModal({ isOpen, onClose, groupId, onPollCreated }: CreatePollModalProps) {
    const [question, setQuestion] = useState('')
    const [description, setDescription] = useState('')
    const [options, setOptions] = useState(['', ''])
    const [isMultiple, setIsMultiple] = useState(false)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleAddOption = () => {
        setOptions([...options, ''])
    }

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return
        setOptions(options.filter((_, i) => i !== index))
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!question || options.some(opt => !opt)) return

        setLoading(true)
        try {
            const res = await fetch('/api/polls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    description,
                    groupId,
                    options: options.filter(opt => opt.trim() !== ''),
                    isMultiple
                })
            })

            if (res.ok) {
                onPollCreated?.()
                onClose()
                // Reset form
                setQuestion('')
                setDescription('')
                setOptions(['', ''])
                setIsMultiple(false)
            }
        } catch (error) {
            console.error('Failed to create poll:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Create a Poll</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <Dismiss24Regular />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Question*</label>
                        <input
                            required
                            placeholder="What's on your mind?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description (Optional)</label>
                        <textarea
                            rows={2}
                            placeholder="Add more context..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className={styles.optionsSection}>
                        <label className={styles.label}>Options*</label>
                        {options.map((option, index) => (
                            <div key={index} className={styles.optionRow}>
                                <input
                                    required
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className={styles.optionInput}
                                    autoComplete="off"
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveOption(index)}
                                    >
                                        <Delete24Regular />
                                    </button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            icon={<Add24Regular />}
                            appearance="subtle"
                            onClick={handleAddOption}
                            disabled={options.length >= 10}
                        >
                            Add Option
                        </Button>
                    </div>

                    <div className={styles.settings}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isMultiple}
                                onChange={(e) => setIsMultiple(e.target.checked)}
                                className={styles.checkboxInput}
                            />
                            Allow multiple answers
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <Button appearance="subtle" onClick={onClose} type="button">Cancel</Button>
                        <Button
                            appearance="primary"
                            type="submit"
                            disabled={loading || !question || options.filter(o => o.trim() !== '').length < 2}
                        >
                            {loading ? 'Creating...' : 'Create Poll'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
