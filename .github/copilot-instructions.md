# Dev Guidelines

## Workflow

- **Before starting**: if requirements are unclear or ambiguous, ask clarifying questions. Do not assume or guess intent.
- **Before finishing**: always run `pnpm check` and fix all reported errors — type errors, lint violations, and formatting issues.
- **Skills**: a set of agent skills is available in `.agents/skills/`. Reference them when relevant.
- **Docs**: when making config or project-wide changes, update the README and other docs if needed.

Treat me as a begginer developer and explain things in a simple way. If you are providing code, please provide a short explanation of what the code does and why it is needed. When you are asking to execute commands, explain what the command does and why you need to run it.

## Stack

React 19 + Vite, TanStack Router (file-based), TanStack Query, Base UI (`@base-ui/react`), SCSS Modules, TypeScript (strict), Vitest, pnpm.

## Commands

```bash
pnpm dev             # dev server on :3000
pnpm build           # typecheck + build
pnpm test            # run tests
pnpm check           # format check + lint + typecheck
pnpm format          # auto-fix formatting and lint
pnpm generate-routes # regenerate routeTree.gen.ts
```

## Project Structure

```
src/
├── components/ui/       # Atomic UI primitives
├── components/<other>/  # Other global shared components
├── features/<feature>/  # Feature modules — components/, hooks/, services/, utils/
├── hooks/               # Global utility hooks
├── lib/                 # Third-party configs (router, queryClient)
├── routes/              # Routing layer only — imports from features/, no logic
├── theme/               # Design tokens (SCSS) + ThemeProvider
├── types/               # Global TS types
└── utils/               # Global pure utilities
```

## Key Rules

- **Routes** are auto-discovered from `src/routes/`. Never edit `src/routeTree.gen.ts` — it is auto-generated.
- **Route files** are pure orchestration: they import components from `features/` and wire up loaders/search params. No business logic inline.
- **Feature slices** own everything for their domain: `components/`, `hooks/`, `services/`, `utils/`. Cross-feature code goes in the top-level `hooks/`, `lib/`, or `utils/`.
- **Path alias**: always use `@/` for imports from `src/`. Never use relative `../../` paths.
- **RTL**: the app is RTL-first. The root layout sets `direction="rtl"` via Base UI's `DirectionProvider`. Change it in `src/routes/__root.tsx` if needed.
- **Theming**: use CSS custom properties from `src/theme/` — never hardcode colors, sizes, or spacing. Tokens use the OKLCH color space and support light/dark via `data-theme` on `<html>`.
- **Components**: use Base UI primitives as the foundation for interactive elements. Add new UI components via the Reshet UI registry: `pnpx shadcn@latest add @reshet-ui/<name>`.

## Naming Conventions

| What                          | Convention                       | Example                      |
| ----------------------------- | -------------------------------- | ---------------------------- |
| Component files & exports     | PascalCase, in a matching folder | `Button/Button.tsx`          |
| Component SCSS modules        | PascalCase, match the component  | `Button/Button.module.scss`  |
| Hook files                    | camelCase, `use` prefix          | `useGreeting.ts`             |
| Feature / folder names        | camelCase                        | `features/userProfile/`      |
| Route files                   | kebab-case                       | `user-profile.$userId.tsx`   |
| Utility & service files       | camelCase                        | `queryClient.ts`, `date.ts`  |
| TypeScript interfaces & types | PascalCase                       | `ButtonProps`, `UserProfile` |

## TypeScript

The project uses strict TypeScript. Avoid `any`. Prefer `interface` for object shapes and `type` for unions/aliases. `noUncheckedIndexedAccess` is enabled — handle potential `undefined` on array/object index access.
