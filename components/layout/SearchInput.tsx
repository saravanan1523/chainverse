'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search24Regular, Person24Regular, Building24Regular, DocumentText24Regular } from '@fluentui/react-icons'
import styles from './SearchInput.module.css'

export function SearchInput() {
    const [query, setQuery] = useState('')
    const [previewResults, setPreviewResults] = useState<any>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const router = useRouter()
    const previewRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
                setShowPreview(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true)
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=5`)
                    const data = await res.json()
                    setPreviewResults(data)
                    setShowPreview(true)
                } catch (error) {
                    console.error('Search preview error:', error)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setPreviewResults(null)
                setShowPreview(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            setShowPreview(false)
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <div className={styles.searchContainer} ref={previewRef}>
            <form className={styles.searchForm} onSubmit={handleSubmit}>
                <div className={styles.searchWrapper}>
                    <Search24Regular className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search posts, people, companies..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim().length >= 2 && setShowPreview(true)}
                    />
                </div>
            </form>

            {showPreview && previewResults && (
                <div className={styles.previewDropdown}>
                    {previewResults.people?.slice(0, 3).map((p: any) => (
                        <div key={p.id} className={styles.previewItem} onClick={() => { router.push(`/profile/${p.id}`); setShowPreview(false); }}>
                            <Person24Regular />
                            <div className={styles.previewContent}>
                                <div className={styles.previewName}>{p.name}</div>
                                <div className={styles.previewMeta}>{p.role || 'Professional'}</div>
                            </div>
                        </div>
                    ))}
                    {previewResults.companies?.slice(0, 2).map((c: any) => (
                        <div key={c.id} className={styles.previewItem} onClick={() => { router.push(`/companies/${c.id}`); setShowPreview(false); }}>
                            <Building24Regular />
                            <div className={styles.previewContent}>
                                <div className={styles.previewName}>{c.name}</div>
                                <div className={styles.previewMeta}>{c.industry}</div>
                            </div>
                        </div>
                    ))}
                    {previewResults.posts?.slice(0, 3).map((p: any) => (
                        <div key={p.id} className={styles.previewItem} onClick={() => { router.push(`/post/${p.id}`); setShowPreview(false); }}>
                            <DocumentText24Regular />
                            <div className={styles.previewContent}>
                                <div className={styles.previewName}>{p.title}</div>
                                <div className={styles.previewMeta}>Post</div>
                            </div>
                        </div>
                    ))}
                    <div className={styles.previewFooter} onClick={handleSubmit}>
                        See all results for "{query}"
                    </div>
                </div>
            )}
        </div>
    )
}
