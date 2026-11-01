# makkie

A minimal [Astro](https://astro.build) project, linted and formatted with [Biome](https://biomejs.dev).

## Getting started

Requires Node.js 18.17+ (or 20+).

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:4321.

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Astro dev server                   |
| `npm run build`     | Build the site to `dist/`                    |
| `npm run preview`   | Serve the production build locally           |
| `npm run check`     | Run Astro type and template diagnostics      |
| `npm run test`      | Run the Vitest unit tests (`tests/`)         |
| `npm run lint`      | Run Biome lint                               |
| `npm run format`    | Format all files with Biome                  |
| `npm run ci`        | Biome CI checks plus Astro check             |

## Code quality

Biome is configured in `biome.json`:

- Recommended lint rules, plus extra `complexity`, `correctness`, and `suspicious` rules
- Cognitive complexity is capped at **8** per function
- Tab indentation, double quotes, 100-column line width
- Respects `.gitignore`

Run `npm run ci` before pushing.

## Quiz session

`/session` runs the FR → NL quiz (5 questions per session). Progress is stored in the browser's
`localStorage` under the key `nl-idioms-v1`. Selection, scheduling and session rules live in
`src/lib/` as pure functions and are covered by `tests/`.

## Project structure

```
.
├── public/             # Static assets served as-is
├── src/
│   ├── data/           # Expression cards (17 fiches)
│   ├── layouts/        # Page layouts
│   ├── lib/            # Pure quiz logic: scheduling, selection, state, metrics
│   ├── pages/          # File-based routes (index, session)
│   └── scripts/        # Client-side code for the session page
├── tests/              # Vitest unit tests
├── astro.config.mjs
├── biome.json
└── tsconfig.json
```
