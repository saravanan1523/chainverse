'use client'

import { useState, useEffect } from 'react'
import { JobCard } from '@/components/jobs/JobCard'
import { RecommendedJobs } from '@/components/jobs/RecommendedJobs'
import { Button } from '@fluentui/react-components'
import { Search24Regular, Filter24Regular, Document24Regular } from '@fluentui/react-icons'
import Link from 'next/link'

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [location, setLocation] = useState('')
    const [jobType, setJobType] = useState('')

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (query) params.append('q', query)
            if (location) params.append('location', location)
            if (jobType) params.append('jobType', jobType)

            const res = await fetch(`/api/jobs?${params.toString()}`)
            const data = await res.json()
            if (Array.isArray(data)) setJobs(data)
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    return (
        <div style={{ maxWidth: '1128px', margin: 'var(--space-lg) auto', padding: '0 var(--space-md)', display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', gap: 'var(--space-lg)' }}>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* My Applications Card */}
                <Link href="/applications" style={{ textDecoration: 'none' }}>
                    <div style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--border-radius-lg)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-normal)'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                    >
                        <Document24Regular style={{ color: 'var(--color-primary)' }} />
                        <div style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>My Job Applications</div>
                    </div>
                </Link>

                {/* Filters Card */}
                <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: 'var(--space-lg)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-lg)' }}>Filters</h2>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>Keywords</label>
                        <input
                            type="text"
                            placeholder="Title, skill, or company"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>Location</label>
                        <input
                            type="text"
                            placeholder="City, state, or zip"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>Job Type</label>
                        <select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}
                        >
                            <option value="">Any</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Part-time">Part-time</option>
                        </select>
                    </div>

                    <Button appearance="primary" style={{ width: '100%' }} onClick={fetchJobs}>
                        Search Jobs
                    </Button>
                </div>
            </aside>

            {/* Main Feed */}
            <main>
                {/* Recommended Jobs Section */}
                <RecommendedJobs />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-bold)' }}>
                        {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
                    </h1>
                </div>

                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                    {isLoading ? (
                        <div style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading jobs...</div>
                    ) : jobs.length > 0 ? (
                        jobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <div style={{ padding: 'var(--space-3xl)', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text-tertiary)' }}>
                            No jobs found matching your criteria.
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
