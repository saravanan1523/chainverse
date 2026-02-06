'use client'

import { useState, useEffect } from 'react'
import { Search24Regular, Filter24Regular } from '@fluentui/react-icons'
import { CompanyCard } from '@/components/companies/CompanyCard'
import { SearchInput } from '@/components/layout/SearchInput' // We might reuse or create a local one for specific filtering
import styles from './companies.module.css'

interface Company {
    id: string
    name: string
    description?: string | null
    industry?: string | null
    locations?: string[]
    verified: boolean
    _count: {
        employees: number
        posts: number
        followers?: number
    }
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchCompanies()
    }, [searchQuery])

    const fetchCompanies = async () => {
        setLoading(true)
        try {
            // Fetch companies with search param if exists
            const url = searchQuery ? `/api/companies?search=${encodeURIComponent(searchQuery)}` : '/api/companies'
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setCompanies(data)
            }
        } catch (error) {
            console.error('Failed to fetch companies', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1>Verified Companies</h1>
                        <p className={styles.subtitle}>Discover and connect with trusted supply chain partners.</p>
                    </div>
                    {/* Local search for the directory */}
                    <div className={styles.searchWrapper}>
                        <Search24Regular className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search companies by name or industry..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={styles.grid}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={styles.skeletonCard} />
                    ))}
                </div>
            ) : companies.length > 0 ? (
                <div className={styles.grid}>
                    {companies.map(company => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏢</div>
                    <h2>No companies found</h2>
                    <p>Try adjusting your search terms or filters.</p>
                </div>
            )}
        </div>
    )
}
