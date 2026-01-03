# Phase 6: Reports & Analytics (Complete Feature)

**Timeline:** Week 8 | **Priority:** 📊 MEDIUM

## Objective

Build **complete analytics system** with sales reports, performance metrics, and visual dashboards. Managers get business intelligence to make data-driven decisions.

## What Gets Built (Full Stack)

### 1. Service Layer (/lib/services/analytics.service.ts)
```typescript
// Sales reports
✅ getDailySales(date)
✅ getPeriodSales(startDate, endDate, period)
✅ getRevenueBySection(startDate, endDate)

// Performance analytics
✅ getTopSellingItems(limit, period)
✅ getSlowMovingItems(limit, period)
✅ getStaffPerformance(startDate, endDate)
✅ getTableTurnover(startDate, endDate)

// Discount analytics
✅ getDiscountUsage(startDate, endDate)
```

### 2. API Routes (8 endpoints)
```typescript
✅ GET /api/reports/sales/daily?date=YYYY-MM-DD
✅ GET /api/reports/sales/period?start=DATE&end=DATE&period=7days
✅ GET /api/reports/revenue/by-section?period=7days
✅ GET /api/reports/items/top-selling?limit=10&period=7days
✅ GET /api/reports/items/slow-moving?limit=10&period=30days
✅ GET /api/reports/staff/performance?start=DATE&end=DATE
✅ GET /api/reports/tables/turnover?period=7days
✅ GET /api/reports/discounts/usage?start=DATE&end=DATE
```

### 3. UI Components
```typescript
✅ /app/reports/page.tsx - Main page (replace UnderDevelopment)
✅ /components/sales-chart.tsx - Sales trend visualization
✅ /components/performance-dashboard.tsx - KPI cards
✅ /components/report-filters.tsx - Date range filters
✅ /components/top-items-chart.tsx - Bar chart
✅ /components/revenue-pie-chart.tsx - Section breakdown
```

### 4. Features
- ✅ Daily sales summary
- ✅ Period-based sales trends
- ✅ Top selling items analysis
- ✅ Slow moving items identification
- ✅ Revenue breakdown by menu section
- ✅ Staff performance metrics
- ✅ Table turnover analysis
- ✅ Discount effectiveness tracking
- ✅ Visual charts (Recharts)
- ✅ Export to CSV (future)

## Implementation Steps

### Step 1: Service Layer (3-4 hours)
Create `/lib/services/analytics.service.ts`:
- Complex Prisma queries with aggregations
- Date range filtering
- GROUP BY for summaries
- JOIN tables for complete data
- Calculate percentages and averages
- Sort and limit results

### Step 2: API Routes (2 hours)
Create 8 report API routes:
- Parse query parameters
- Call analytics service
- Format responses
- Add pagination where needed
- Auth: Manager and Admin only

### Step 3: Reports Page UI (2-3 hours)
Edit `/app/reports/page.tsx`:
- Tab interface for different reports
- Date range filters
- Period selection (7days/30days/90days)
- Display reports as tables and charts
- Loading states

### Step 4: Charts & Visualizations (2-3 hours)
Create chart components:
- Line chart for sales trends (Recharts)
- Bar chart for top items
- Pie chart for revenue by section
- KPI cards for key metrics
- Responsive chart sizing

### Step 5: Dashboard Enhancement (1-2 hours)
Update `/app/dashboard/page.tsx`:
- Replace mock data with real API calls
- Show today's sales
- Top items today
- Active orders count
- Revenue trends chart

### Step 6: Testing (1 hour)
- Test all report queries
- Test date range filtering
- Test period selection
- Test charts render correctly
- Test pagination
- Test empty data states
- Test Manager role access

## Report Types

### 1. Daily Sales
```json
{
  "date": "2025-12-29",
  "total_receipts": 45,
  "total_revenue": 2450.75,
  "average_order_value": 54.46,
  "dine_in_orders": 30,
  "delivery_orders": 15
}
```

### 2. Top Selling Items
```json
[
  {
    "item_id": 15,
    "name": "Classic Burger",
    "quantity_sold": 120,
    "revenue": 1558.80,
    "price": 12.99
  }
]
```

### 3. Revenue by Section
```json
[
  {
    "section_id": 1,
    "section_name": "Appetizers",
    "total_revenue": 1850.75,
    "revenue_percentage": 35.5
  }
]
```

### 4. Staff Performance
```json
[
  {
    "user_id": 5,
    "fullname": "John Doe",
    "orders_count": 45,
    "total_revenue": 2450.75,
    "average_order_value": 54.46
  }
]
```

## Date Ranges

**Predefined Periods:**
- `7days` - Last 7 days
- `30days` - Last 30 days
- `90days` - Last 90 days

**Custom Range:**
- `start=2025-01-01&end=2025-01-31`

## Acceptance Criteria (Done When...)

- [ ] All 8 API endpoints working
- [ ] `/app/reports/page.tsx` shows reports (no UnderDevelopment)
- [ ] Daily sales report accurate
- [ ] Period reports calculate correctly
- [ ] Top/slow items sorted properly
- [ ] Revenue by section sums to total
- [ ] Staff performance matches actual
- [ ] Charts display real data
- [ ] Date filters work
- [ ] Period selection works
- [ ] Dashboard uses real data
- [ ] Manager/Admin access only
- [ ] Works on mobile
- [ ] No console errors

## Files Created/Modified

```
NEW FILES:
- /lib/services/analytics.service.ts
- /app/api/reports/sales/daily/route.ts
- /app/api/reports/sales/period/route.ts
- /app/api/reports/revenue/by-section/route.ts
- /app/api/reports/items/top-selling/route.ts
- /app/api/reports/items/slow-moving/route.ts
- /app/api/reports/staff/performance/route.ts
- /app/api/reports/tables/turnover/route.ts
- /app/api/reports/discounts/usage/route.ts
- /components/sales-chart.tsx
- /components/performance-dashboard.tsx
- /components/report-filters.tsx
- /components/top-items-chart.tsx
- /components/revenue-pie-chart.tsx

MODIFIED FILES:
- /app/reports/page.tsx (replace UnderDevelopment)
- /app/dashboard/page.tsx (use real data instead of mock)
```

## Chart Library (Already Installed)

Using **Recharts 2.15.4**:
```typescript
import { LineChart, BarChart, PieChart } from 'recharts'
```

Examples already in:
- `/components/chart-area-interactive.tsx`
- `/app/page.tsx` (dashboard)

## Next Phase

After reports are complete, move to **Phase 7: Audit Logs** for compliance and activity tracking.

---
**Phase Version:** 2.0 (Vertical Slice)
**Last Updated:** December 29, 2025
