'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Person24Regular, Building24Regular, Briefcase24Regular, PeopleCommunity24Regular, DocumentText24Regular, NumberSymbol24Regular } from '@fluentui/react-icons'
import { Tab, TabList } from '@fluentui/react-components'
import styles from './search.module.css'

function SearchResults() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q')
    const [results, setResults] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return
            setIsLoading(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`)
                const data = await res.json()
                setResults(data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchResults()
    }, [query, activeTab])

    if (!query) return <div className={styles.emptyState}>Enter a keyword to search</div>
    if (isLoading) return <div className={styles.loading}>Searching for "{query}"...</div>

    const hasResults = results?.people?.length || results?.jobs?.length || results?.companies?.length || results?.groups?.length || results?.posts?.length || results?.tags?.length

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Search results for "{query}"</h1>

            <TabList
                selectedValue={activeTab}
                onTabSelect={(_, data) => setActiveTab(data.value as string)}
                className={styles.tabList}
            >
                <Tab value="all">All</Tab>
                <Tab value="posts">Posts</Tab>
                <Tab value="people">People</Tab>
                <Tab value="companies">Companies</Tab>
                <Tab value="jobs">Jobs</Tab>
                <Tab value="groups">Groups</Tab>
                <Tab value="tags">Topics</Tab>
            </TabList>

            {/* Posts */}
            {results?.posts?.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionHeader}>
                        <DocumentText24Regular /> Posts
                    </h2>
                    <div className={styles.grid}>
                        {results.posts.map((p: any) => (
                            <Link href={`/post/${p.id}`} key={p.id} className={styles.card}>
                                <div className={styles.cardTitle}>{p.title}</div>
                                <div className={styles.cardSubtitle}>by {p.author?.name || p.company?.name || 'Unknown'}</div>
                                <div className={styles.cardMeta}>
                                    {p._count?.reactions || 0} reactions • {p._count?.comments || 0} comments
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* People */}
            {results?.people?.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionHeader}>
                        <Person24Regular /> People
                    </h2>
                    <div className={styles.grid}>
                        {results.people.map((p: any) => (
                            <Link href={`/profile/${p.id}`} key={p.id} className={styles.peopleCard}>
                                <div className={styles.avatar}>{p.name.charAt(0)}</div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                    <div className={styles.cardSubtitle}>{p.role || 'Professional'}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Jobs */}
            {results?.jobs?.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionHeader}>
                        <Briefcase24Regular /> Jobs
                    </h2>
                    <div className={styles.grid}>
                        {results.jobs.map((j: any) => (
                            <Link href={`/jobs/${j.id}`} key={j.id} className={styles.card}>
                                <div className={styles.cardTitle}>{j.title}</div>
                                <div style={{ fontSize: '14px' }}>{j.company} • {j.location}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Companies */}
            {results?.companies?.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionHeader}>
                        <Building24Regular /> Companies
                    </h2>
                    <div className={styles.grid}>
                        {results.companies.map((c: any) => (
                            <Link href={`/companies/${c.id}`} key={c.id} className={styles.peopleCard}>
                                <div className={styles.companyAvatar}>{c.name.substring(0, 2).toUpperCase()}</div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                                    <div className={styles.cardSubtitle}>{c.industry}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Groups */}
            {results?.groups?.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionHeader}>
                        <PeopleCommunity24Regular /> Groups
                    </h2>
                    <div className={styles.grid}>
                        {results.groups.map((g: any) => (
                            <Link href={`/groups/${g.id}`} key={g.id} className={styles.card}>
                                <div style={{ fontWeight: 'bold' }}>{g.name}</div>
                                <div className={styles.cardSubtitle}>{g.type} Group</div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            {results?.tags?.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionHeader}>
                        <NumberSymbol24Regular /> Topics
                    </h2>
                    <div className={styles.tagContainer}>
                        {results.tags.map((t: any) => (
                            <Link href={`/tags/${t.name}`} key={t.id} className={styles.tag}>
                                #{t.displayName} <span className={styles.tagCount}>{t.postCount}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {!hasResults && (
                <div className={styles.emptyState}>
                    No results found for "{query}". Try a different keyword.
                </div>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#aeaeae' }}>Loading Search...</div>}>
            <SearchResults />
        </Suspense>
    )
}

