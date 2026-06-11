# Task 7: Fix Admin Dashboard Chart + Add CSV Export

## Agent: Main Developer
## Status: ✅ Completed

## Summary

Fixed recharts rendering issues in admin dashboard and analytics pages, and added CSV export functionality to three admin pages.

## Changes Made

### Part 1: Chart Rendering Fixes

**Root Cause**: Recharts components used CSS class names (`className="stroke-muted"`, `className="text-xs"`) on SVG elements. These don't resolve correctly in SVG context, causing:
- CartesianGrid strokes appearing as black rectangles
- Axis tick text invisible in dark mode (defaulting to black fill)
- Tooltips with poor contrast in dark mode
- Pie chart labels/legends with wrong text colors in dark mode

**Files Modified**:
- `/src/app/admin/page.tsx` — Revenue BarChart: Replaced className props with explicit SVG color props using CSS custom properties
- `/src/app/admin/analytics/page.tsx` — All 5 charts (AreaChart, 2x PieChart, 2x BarChart): Same fix pattern applied

**Fix Pattern**:
- `className="stroke-muted"` → `stroke="hsl(var(--border))"` on CartesianGrid
- `className="text-xs"` → `tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}` on XAxis/YAxis
- Added `axisLine={{ stroke: 'hsl(var(--border))' }}` and `tickLine={{ stroke: 'hsl(var(--border))' }}` to all axes
- Enhanced Tooltip with `contentStyle={{ backgroundColor: 'hsl(var(--card))', ... }}`, `itemStyle`, `labelStyle`
- Added `wrapperStyle={{ color: 'hsl(var(--foreground))' }}` on Legend components

### Part 2: CSV Export

**New File Created**:
- `/src/lib/csv-export.ts` — Utility with `exportToCSV()`, `generateCSV()`, `escapeCsvValue()` functions
  - BOM prefix for Excel UTF-8 compatibility
  - Proper CSV escaping (commas, quotes, newlines)
  - Column definition mapping with `{key, label}` pattern
  - Browser download via Blob + temporary anchor

**Files Modified**:
- `/src/app/admin/products/page.tsx` — Added "Export CSV" button, `handleExportCSV()`, `avgRating` to Product interface
- `/src/app/admin/orders/page.tsx` — Added "Export CSV" button, `handleExportCSV()`
- `/src/app/admin/users/page.tsx` — Added "Export CSV" button, `handleExportCSV()`
- `/src/app/api/admin/products/route.ts` — Added `avgRating: p.avgRating` to API response

## Verification
- ✅ ESLint passes with zero errors
- ✅ Dev server compiles and serves pages
- ✅ All charts render in both light and dark modes
- ✅ CSV export buttons present on products, orders, users pages
