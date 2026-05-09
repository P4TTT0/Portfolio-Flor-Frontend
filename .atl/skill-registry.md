# Skill Registry — portfolio-flor-frontend

**Generated**: 2026-05-08
**Mode**: none (no openspec, Engram only)

## Project Skills (`.agents/skills/`)

---

### next-best-practices
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/next-best-practices/SKILL.md`
**Description**: Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling

**Compact Rules**:
- Next.js 16 has breaking changes — read `node_modules/next/dist/docs/` before writing code
- Middleware renamed to "proxy" in Next.js 16
- Async `params` and `searchParams` require awaiting in Next.js 15+
- Use `'use cache'` directive for caching, not `unstable_cache()`
- Use `next/image` over `<img>` for all images
- Avoid data waterfalls — use `Promise.all()` or Suspense boundaries
- Server Actions are public endpoints — always verify auth inside the action
- Don't pass non-serializable props to client components
- Use `after()` from `next/server` for non-blocking operations

---

### react-best-practices (vercel-react-best-practices)
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/react-best-practices/SKILL.md`
**Description**: React and Next.js performance optimization guidelines from Vercel Engineering.

**Compact Rules**:
- Eliminate waterfalls first — CRITICAL priority; use Promise.all(), Suspense, better-all
- Avoid barrel imports (lucide-react, @mui/material) — use direct imports instead
- Use `React.cache()` for per-request deduplication of DB/async calls
- Derive state during render, not in useEffect
- Don't define components inside components — creates new type on every render
- Use `useDeferredValue` for expensive derived renders
- Prefer `useTransition` over manual loading states
- Wrap dynamic client-only content in `<script>` or suppressHydrationWarning
- Module-level mutable state causes cross-request contamination in RSC
- Hoist static I/O to module level to avoid per-request fetches

---

### tailwind-css-patterns
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/tailwind-css-patterns/SKILL.md`
**Description**: Comprehensive Tailwind CSS utility-first styling patterns.

**Compact Rules**:
- Mobile-first: base styles for mobile, add `sm:`, `md:`, `lg:` prefixes for larger screens
- Tailwind v4 uses CSS-first config via `@theme` in globals.css (no tailwind.config.js)
- Use `@tailwindcss/postcss` plugin for v4
- Extract repeated class patterns into reusable components
- Use CSS variables via `@theme` for design tokens
- `dark:` prefix for dark mode when using `darkMode: 'class'`
- Respect `prefers-reduced-motion` with `motion-reduce:` variants
- Test at each breakpoint using browser DevTools responsive mode
- Content paths in config ensure classes aren't purged in production

---

### frontend-design
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/frontend-design/SKILL.md`
**Description**: Create distinctive, production-grade frontend interfaces with high design quality.

**Compact Rules**:
- Commit to a BOLD aesthetic direction — don't default to generic AI aesthetics
- Typography: avoid Inter/Roboto/Arial; choose distinctive fonts that elevate the design
- Color: use CSS variables; dominant colors with sharp accents > timid evenly-distributed palettes
- Motion: prioritize CSS-only solutions; use `animation-delay` for staggered reveals
- Never use purple gradients on white backgrounds or cliched AI aesthetics
- Vary aesthetics per project — don't converge on common choices like Space Grotesk
- Match implementation complexity to aesthetic vision — maximalism needs elaborate code
- Add depth: gradient meshes, noise textures, geometric patterns, layered transparencies

---

### seo
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/seo/SKILL.md`
**Description**: Optimize for search engine visibility and ranking.

**Compact Rules**:
- Single `<h1>` per page with primary keyword near beginning
- Title tags: 50-60 chars with primary keyword; unique per page
- Meta descriptions: 150-160 chars with call-to-action; unique per page
- Use semantic HTML; proper heading hierarchy (don't skip levels)
- Descriptive alt text for all images (don't leave alt empty except for decorative)
- Canonical URLs on all pages to prevent duplicate content issues
- Structured data (JSON-LD) for Organization, Article, Product, FAQ, Breadcrumbs
- Mobile-responsive viewport and 44px minimum tap targets
- Internal links use descriptive anchor text with keywords

---

### accessibility
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/accessibility/SKILL.md`
**Description**: Audit and improve web accessibility following WCAG 2.2 guidelines.

**Compact Rules**:
- All interactive elements keyboard accessible via Tab/Enter/Space
- Color contrast: 4.5:1 minimum for normal text (AA), 7:1 for AAA
- Don't remove `outline` — use `:focus-visible` for keyboard focus indicators
- Target size minimum 24x24 CSS pixels (44x44 recommended)
- Form inputs require programmatically associated `<label>`
- Announce errors with `role="alert"` or `aria-live`, set `aria-invalid="true"` on invalid fields
- Images need alt text (empty `alt=""` for decorative only)
- Use native `<button>` elements; don't use `div[role="button"]`
- Skip links for keyboard users to bypass repetitive navigation
- Respect `prefers-reduced-motion` — disable animations when set

---

### nodejs-backend-patterns
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/nodejs-backend-patterns/SKILL.md`
**Description**: Build production-ready Node.js backend services with Express/Fastify.

**Compact Rules**:
- Layered architecture: Controllers → Services → Repositories
- Input validation at API boundary using Zod or Joi
- Custom error classes with appropriate HTTP status codes
- Centralized error handler middleware
- Parameterized queries only — never string concatenation for SQL
- Rate limiting on public endpoints
- Use environment variables for all secrets
- Async operations: `Promise.all()` for parallel independent operations
- Connection pooling for database connections
- Request logging with structured logger (Pino, Winston)

---

### nodejs-best-practices
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/nodejs-best-practices/SKILL.md`
**Description**: Node.js development principles and decision-making.

**Compact Rules**:
- Framework selection depends on context: Hono (edge/serverless), Fastify (performance), Express (legacy)
- ESM is the modern standard; prefer `import/export` over `require()`
- Fail fast: validate at API entry point before DB operations
- Trust nothing: validate all inputs including headers, cookies, external APIs
- Security: parameterized queries, bcrypt/argon2 for passwords, JWT verification
- Don't block the event loop with sync operations or CPU-intensive work
- Use `async/await` for I/O; offload CPU work to worker threads
- Profile before optimizing — don't guess bottlenecks
- Layered architecture for growing projects; single file for scripts/prototypes

---

### next-cache-components
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/next-cache-components/SKILL.md`
**Description**: Next.js 16 Cache Components - PPR, use cache directive, cacheLife, cacheTag, updateTag

**Compact Rules**:
- Enable via `cacheComponents: true` in next.config.ts (replaces `experimental.ppr`)
- Three content types: Static (sync code), Cached (`'use cache'`), Dynamic (Suspense)
- Cannot use `cookies()`, `headers()`, `searchParams` inside `'use cache'` — pass as args
- `'use cache'` generates cache keys automatically from function args and closures
- Use `cacheLife('hours')` or `cacheLife({ stale: 3600, revalidate: 7200 })` for custom duration
- Use `cacheTag('name')` + `revalidateTag('name')` for manual invalidation
- Use `updateTag('name')` for immediate same-request invalidation
- Cache Components don't support Edge runtime or static export
- Migrate: `unstable_cache()` → `'use cache'`, `force-static` → `cacheLife('max')`

---

### typescript-advanced-types
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/typescript-advanced-types/SKILL.md`
**Description**: Master TypeScript's advanced type system including generics, conditional types, mapped types, template literals, and utility types.

**Compact Rules**:
- Use `unknown` over `any` — enforce type safety
- Generics: create reusable components while maintaining type safety
- Conditional types: `T extends string ? true : false` for type-level logic
- Mapped types: transform existing types by iterating over properties
- Template literal types: `\`on${Capitalize<Event>}\`` for string patterns
- Utility types: `Partial<T>`, `Pick<T,K>`, `Omit<T,K>`, `Record<K,V>`, `Exclude<T,U>`, `Extract<T,U>`
- Discriminated unions for type-safe state machines
- Type inference: let TypeScript infer when possible
- Use `interface` for object shapes (better errors); `type` for unions
- Build-mode TypeScript: `tsc --noEmit` for type checking

---

### composition-patterns (vercel-composition-patterns)
**Path**: `file:///C:/Develop/portfolio-flor/frontend-nextjs/.agents/skills/composition-patterns/SKILL.md`
**Description**: React composition patterns that scale.

**Compact Rules**:
- Don't use boolean props (`isThread`, `isEditing`) — use composition instead
- Compound components: share context via `createContext` + `use()`
- Provider is the only place that knows how state is managed; UI consumes context interface
- Use explicit variant components: `<ThreadComposer>` not `<Composer isThread />`
- Prefer children composition over render props
- Lift state into provider components — enables sibling access without prop drilling
- Define generic context interface: `{ state, actions, meta }` for dependency injection
- React 19: `ref` is a regular prop (no `forwardRef`); use `use()` instead of `useContext()`
- `use()` can be called conditionally unlike `useContext()`

---

## System Skills (user-level, `~/.config/opencode/skills/`)

| Name | Path | Trigger |
|------|------|---------|
| sdd-apply | `~/.config/opencode/skills/sdd-apply/SKILL.md` | Implement SDD tasks from specs and design |
| sdd-archive | `~/.config/opencode/skills/sdd-archive/SKILL.md` | Archive completed SDD change |
| sdd-design | `~/.config/opencode/skills/sdd-design/SKILL.md` | Create SDD technical design |
| sdd-explore | `~/.config/opencode/skills/sdd-explore/SKILL.md` | Explore SDD ideas before committing |
| sdd-init | `~/.config/opencode/skills/sdd-init/SKILL.md` | Initialize SDD context and persistence |
| sdd-onboard | `~/.config/opencode/skills/sdd-onboard/SKILL.md` | Walk through full SDD cycle |
| sdd-propose | `~/.config/opencode/skills/sdd-propose/SKILL.md` | Create SDD change proposal |
| sdd-spec | `~/.config/opencode/skills/sdd-spec/SKILL.md` | Write SDD delta specs |
| sdd-tasks | `~/.config/opencode/skills/sdd-tasks/SKILL.md` | Break SDD change into tasks |
| sdd-verify | `~/.config/opencode/skills/sdd-verify/SKILL.md` | Verify implementation matches specs |
| work-unit-commits | `~/.config/opencode/skills/work-unit-commits/SKILL.md` | Plan commits as reviewable work units |
| judgment-day | `~/.config/opencode/skills/judgment-day/SKILL.md` | Run blind dual review |
| skill-registry | `~/.config/opencode/skills/skill-registry/SKILL.md` | Create/update skill registry |

---

## Project Conventions

**AGENTS.md**: `<!-- BEGIN:nextjs-agent-rules -->` — warns about Next.js 16 breaking changes

**CLAUDE.md**: `@AGENTS.md` — defers to AGENTS.md

**ESLint**: Flat config format with `eslint-config-next/core-web-vitals` + typescript rules

**Tailwind v4**: CSS-first configuration in `globals.css` via `@theme` directive

**Sanity**: Client configured in `src/lib/sanity.ts` with `@sanity/client` + `@sanity/image-url`