'use client'

import { useState, useEffect } from 'react'
import styles from './dashboard.module.css'

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
    }, [])

    if (!data) return <div className={styles.loading}>Loading Dashboard...</div>

    return (
        <div>
            <h1 className={styles.title}>Platform Overview</h1>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.value}>{data.stats.users}</div>
                    <div className={styles.label}>Total Users</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.value}>{data.stats.companies}</div>
                    <div className={styles.label}>Companies</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.value}>{data.stats.jobs}</div>
                    <div className={styles.label}>Active Jobs</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.value}>{data.stats.posts}</div>
                    <div className={styles.label}>Total Posts</div>
                </div>
            </div>

            <h2 className={styles.subtitle}>Recent Registrations</h2>
            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.recentUsers.map((user: any) => (
                            <tr key={user.id}>
                                <td>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>{user.name[0]}</div>
                                        <div>
                                            <div className={styles.name}>{user.name}</div>
                                            <div className={styles.email}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.role}</td>
                                <td>
                                    {user.isPremium ? (
                                        <span className={styles.badgePro}>Premium</span>
                                    ) : (
                                        <span className={styles.badgeFree}>Free</span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
