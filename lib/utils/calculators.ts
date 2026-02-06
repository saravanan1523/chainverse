/**
 * Logistics and Supply Chain Calculation Engine
 */

/**
 * Calculate Inventory Turnover Ratio
 * Formula: Cost of Goods Sold / Average Inventory
 */
export function calculateInventoryTurnover(cogs: number, averageInventory: number) {
    if (averageInventory === 0) return 0
    return parseFloat((cogs / averageInventory).toFixed(2))
}

/**
 * Calculate Days Sales of Inventory (DSI)
 * Formula: (Average Inventory / COGS) * 365
 */
export function calculateDSI(cogs: number, averageInventory: number) {
    if (cogs === 0) return 0
    return Math.round((averageInventory / cogs) * 365)
}

/**
 * Calculate Freight Cost per Unit
 * Formula: Total Freight Cost / Number of Units
 */
export function calculateFreightPerUnit(totalCost: number, units: number) {
    if (units === 0) return 0
    return parseFloat((totalCost / units).toFixed(2))
}

/**
 * Calculate Warehouse Utilization Percentage
 * Formula: (Occupied Space / Total Capacity) * 100
 */
export function calculateWarehouseUtilization(occupied: number, capacity: number) {
    if (capacity === 0) return 0
    return Math.round((occupied / capacity) * 100)
}

/**
 * Calculate Economic Order Quantity (EOQ)
 * Formula: sqrt((2 * Demand * Ordering Cost) / Holding Cost)
 */
export function calculateEOQ(demand: number, orderingCost: number, holdingCost: number) {
    if (holdingCost === 0) return 0
    return Math.round(Math.sqrt((2 * demand * orderingCost) / holdingCost))
}

/**
 * Calculate Reorder Point (ROP)
 * Formula: (Lead Time * Demand per Day) + Safety Stock
 */
export function calculateROP(leadTimeDays: number, dailyDemand: number, safetyStock: number) {
    return Math.round((leadTimeDays * dailyDemand) + safetyStock)
}
