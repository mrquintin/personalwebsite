# Projects content layer

Each project is a TypeScript module exporting a `Project` (see
`src/lib/projects/types.ts`).

To add a new project:

1. Create `src/content/projects/<slug>.ts` exporting the project as
   default.
2. Add one import line to `src/lib/projects/loader.ts`.
3. (Optional) create a custom route under `src/app/<slug>/page.tsx`
   and set `customPage: "/<slug>"`. Without `customPage`, the generic
   dossier scaffold at `/projects/[slug]` renders.
4. (Optional) drop bespoke data under
   `src/content/projects/<slug>/...` for custom components to consume.

## Contract with the dossier scaffold

The scaffold at `src/app/projects/[slug]/page.tsx` consumes:

- `code`, `title`, `tagline`, `summary` — header + synopsis
- `classification` — banner label
- `kind`, `status`, `stage`, `startedISO`, `updatedISO`, `authors` — metadata pane
- `links` — artifacts block
- `citation` — citation block (auto-generated if absent)
- `mediaHeroSrc` — optional media slot
