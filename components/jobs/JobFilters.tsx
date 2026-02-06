'use client'

import { useState } from 'react'
import {
    Search24Regular,
    Filter24Regular,
    Dismiss24Regular
} from '@fluentui/react-icons'
import { Checkbox } from '@fluentui/react-components'
import styles from './jobFilters.module.css'

interface JobFiltersProps {
    onFilterChange?: (filters: any) => void
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
    const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>([])
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const jobTypes = ['Full-time', 'Part-time', 'Contract']
    const locationTypes = ['Remote', 'On-site', 'Hybrid']

    const handleJobTypeChange = (type: string, checked: boolean) => {
        setSelectedJobTypes(prev =>
            checked ? [...prev, type] : prev.filter(t => t !== type)
        )
    }

    const handleLocationTypeChange = (type: string, checked: boolean) => {
        setSelectedLocationTypes(prev =>
            checked ? [...prev, type] : prev.filter(t => t !== type)
        )
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedJobTypes([])
        setSelectedLocationTypes([])
    }

    return (
        <>
            {/* Mobile Filter Button */}
            <button
                className={styles.mobileToggle}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Filter24Regular />
                <span>Filters</span>
            </button>

            {/* Filters Sidebar */}
            <div className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Filter Jobs</h3>
                    <button
                        className={styles.closeButton}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <Dismiss24Regular />
                    </button>
                </div>

                {/* Search */}
                <div className={styles.section}>
                    <div className={styles.searchContainer}>
                        <Search24Regular className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by title, company..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Job Type Filter */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Job Type</h4>
                    {jobTypes.map((type) => (
                        <div key={type} className={styles.checkboxItem}>
                            <Checkbox
                                label={type}
                                checked={selectedJobTypes.includes(type)}
                                onChange={(e, data) =>
                                    handleJobTypeChange(type, !!data.checked)
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* Location Type Filter */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Location Type</h4>
                    {locationTypes.map((type) => (
                        <div key={type} className={styles.checkboxItem}>
                            <Checkbox
                                label={type}
                                checked={selectedLocationTypes.includes(type)}
                                onChange={(e, data) =>
                                    handleLocationTypeChange(type, !!data.checked)
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedJobTypes.length > 0 || selectedLocationTypes.length > 0) && (
                    <button className={styles.clearButton} onClick={clearFilters}>
                        Clear all filters
                    </button>
                )}
            </div>

            {isMobileOpen && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}
