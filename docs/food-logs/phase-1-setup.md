# Food Logs Screen — Phase 1: Setup & Foundation

## Overview

A dedicated screen for querying and viewing food log records from a SAP backend. Users fill in a search form (some fields required, some optional), submit it, and the results appear in a scrollable, sortable data table below.

---

## Feature Folder Structure

```
src/features/foodLogs/
├── components/
│   ├── FoodLogsPage/
│   │   ├── FoodLogsPage.tsx          # Top-level page layout
│   │   └── FoodLogsPage.module.scss
│   ├── FoodLogsSearchForm/
│   │   ├── FoodLogsSearchForm.tsx    # Search form UI
│   │   └── FoodLogsSearchForm.module.scss
│   └── FoodLogsTable/
│       ├── FoodLogsTable.tsx         # Results table (sortable, scrollable)
│       └── FoodLogsTable.module.scss
├── hooks/
│   └── useFoodLogs.ts                # TanStack Query hook
├── services/
│   └── foodLogsApi.ts                # SAP API calls + response mapping
└── types/
    └── foodLog.ts                    # TypeScript types & Zod schemas
```

Also create the route file:

```
src/routes/food-logs.tsx              # TanStack Router file-based route
```

---

## Dependencies to Install

All UI components are installed from the **Reshet UI registry** via `pnpx shadcn@latest add @reshet-ui/<name>`. Do not add `@tanstack/react-table` directly — `@reshet-ui/data-table` bundles it.

| Package / Component      | Reason                                       | How to install                                  |
| ------------------------ | -------------------------------------------- | ----------------------------------------------- |
| `zod`                    | Search param schema + validation             | `pnpm add zod` (verify if already installed)    |
| `@uniform-ts/core`       | Headless Zod-driven search form              | `pnpm add @uniform-ts/core`                     |
| `@reshet-ui/data-table`  | Sortable, scrollable data table              | `pnpx shadcn@latest add @reshet-ui/data-table`  |
| `@reshet-ui/date-picker` | Date inputs for DATUM fields                 | `pnpx shadcn@latest add @reshet-ui/date-picker` |
| `@reshet-ui/input`       | Text inputs for string fields                | `pnpx shadcn@latest add @reshet-ui/input`       |
| `@reshet-ui/button`      | Search + Reset action buttons                | `pnpx shadcn@latest add @reshet-ui/button`      |
| `@reshet-ui/field`       | Label + input + error wrapper per field      | `pnpx shadcn@latest add @reshet-ui/field`       |
| `@reshet-ui/fieldset`    | Groups related form fields (e.g. date range) | `pnpx shadcn@latest add @reshet-ui/fieldset`    |
| `@reshet-ui/skeleton`    | Skeleton loading rows in the table           | `pnpx shadcn@latest add @reshet-ui/skeleton`    |
| `@reshet-ui/empty`       | Empty-results state in the table             | `pnpx shadcn@latest add @reshet-ui/empty`       |
| `@reshet-ui/scroll-area` | Styled cross-browser scrollbar for the table | `pnpx shadcn@latest add @reshet-ui/scroll-area` |
| `@reshet-ui/spinner`     | In-button loading indicator during fetch     | `pnpx shadcn@latest add @reshet-ui/spinner`     |
| `@reshet-ui/toast`       | Error notifications                          | `pnpx shadcn@latest add @reshet-ui/toast`       |

---

## Environment Variables

Create a `.env` file (and a committed `.env.example`) at the project root:

```
VITE_SAP_API_BASE_URL=https://your-sap-server.example.com
VITE_SAP_USERNAME=your-username
VITE_SAP_PASSWORD=your-password
```

> **Security note:** `VITE_SAP_PASSWORD` is a build-time env var exposed to the browser bundle. This is acceptable only for internal/intranet apps where the network perimeter is the access control. Do not use this pattern for public-facing applications.
