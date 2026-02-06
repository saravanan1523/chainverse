'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
    calculateInventoryTurnover,
    calculateEOQ,
    calculateWarehouseUtilization
} from '@/lib/utils/calculators'
import styles from './tools.module.css'

export default function ToolsPage() {
    // Inventory Calculator State
    const [cogs, setCogs] = useState(100000)
    const [avgInv, setAvgInv] = useState(25000)

    // EOQ Calculator State
    const [demand, setDemand] = useState(12000)
    const [ordCost, setOrdCost] = useState(50)
    const [holdCost, setHoldCost] = useState(2)

    // WH Utilization State
    const [occ, setOcc] = useState(8500)
    const [cap, setCap] = useState(10000)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Supply Chain Toolbox</h1>
                <p className={styles.subtitle}>Professional calculators and utilities for logistics experts</p>
            </div>

            <div className={styles.grid}>
                {/* Inventory Turnover */}
                <Card className={styles.toolCard}>
                    <h3 className={styles.toolTitle}>Inventory Turnover</h3>
                    <div className={styles.inputGroup}>
                        <label>Cost of Goods Sold ($)</label>
                        <input type="number" value={cogs} onChange={e => setCogs(Number(e.target.value))} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Average Inventory ($)</label>
                        <input type="number" value={avgInv} onChange={e => setAvgInv(Number(e.target.value))} />
                    </div>
                    <div className={styles.result}>
                        <span className={styles.resultLabel}>Turnover Ratio</span>
                        <span className={styles.resultValue}>{calculateInventoryTurnover(cogs, avgInv)}x</span>
                    </div>
                </Card>

                {/* EOQ */}
                <Card className={styles.toolCard}>
                    <h3 className={styles.toolTitle}>Economic Order Quantity (EOQ)</h3>
                    <div className={styles.inputGroup}>
                        <label>Annual Demand (Units)</label>
                        <input type="number" value={demand} onChange={e => setDemand(Number(e.target.value))} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Fixed Ordering Cost ($)</label>
                        <input type="number" value={ordCost} onChange={e => setOrdCost(Number(e.target.value))} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Annual Holding Cost ($/unit)</label>
                        <input type="number" value={holdCost} onChange={e => setHoldCost(Number(e.target.value))} />
                    </div>
                    <div className={styles.result}>
                        <span className={styles.resultLabel}>Optimal Order Size</span>
                        <span className={styles.resultValue}>{calculateEOQ(demand, ordCost, holdCost)} Units</span>
                    </div>
                </Card>

                {/* Warehouse Utilization */}
                <Card className={styles.toolCard}>
                    <h3 className={styles.toolTitle}>Warehouse Utilization</h3>
                    <div className={styles.inputGroup}>
                        <label>Occupied Space (Sq. Ft.)</label>
                        <input type="number" value={occ} onChange={e => setOcc(Number(e.target.value))} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Total Capacity (Sq. Ft.)</label>
                        <input type="number" value={cap} onChange={e => setCap(Number(e.target.value))} />
                    </div>
                    <div className={styles.result}>
                        <span className={styles.resultLabel}>Utilization %</span>
                        <span className={styles.resultValue}>{calculateWarehouseUtilization(occ, cap)}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${Math.min(calculateWarehouseUtilization(occ, cap), 100)}%` }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    )
}
