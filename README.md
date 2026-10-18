<div align="center">
  <!--<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://highseas.hackclub.com/api/stats?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://highseas.hackclub.com/api/stats?theme=light">
    <img alt="stats display" src="https://highseas.hackclub.com/api/stats">
  </picture>-->

  <img src="https://github.com/user-attachments/assets/a7da63c4-eb4b-4fe6-b048-e441d1cb86d9" width="400">
  <h1>Build personal projects. Get free stuff.</h1>
</div>

_Welcome to the Hack Club High Seas._
Built by a team of 20 teenagers from around the world, High Seas is a global challenge to every teenager to build awesome projects and get rewarded.

Prizes range from iPads, Framework Laptops, Flipper Zeroes, and more.

High Seas is the successor to [Arcade](https://hackclub.com/arcade/), Hack Club’s summer 2024 celebration of making. 5,000 high schoolers from 119 countries built over 2,000 projects and were shipped over 11,000 packages of prizes.

## Local development

Use Node.js 24 (`nvm use`) and Bun 1.4.3. Install the locked dependencies with
`bun install --frozen-lockfile`, then start the app with `bun run dev`.

The app uses Next.js 16, React 19, and Tailwind CSS 4. Development and production
builds use Turbopack, including the YAML loader for dialogue data.

Run `bun run build` for a production build and `bun run start` to serve it.
Use `bun run lint` / `bun run lint:fix` for Oxlint, `bun run fmt` /
`bun run fmt:check` for Oxfmt, and `bun run test` for the session migration tests.
CI checks formatting, linting, tests, and Next.js route type generation.

`bun run typecheck` reports application type errors. This repository already had
219 TypeScript diagnostics before the upgrade; production builds retain the
existing `ignoreBuildErrors` setting while that backlog is addressed. Existing
lint violations are reported as warnings in `.oxlintrc.json`; other correctness
rules remain errors.

Storage uses the current Neon, Upstash Redis, and Vercel Global Config SDKs.
Existing `POSTGRES_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `EDGE_CONFIG`
credentials still work. New integrations can also use `DATABASE_URL`,
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `GLOBAL_CONFIG`.
The clients initialize when used, so builds do not require live storage access.

You should configure your tokens/env based on the `example.env` (`cp example.env .env`), or if you're on the vercel team you can `bunx vercel env pull` to automatically load them up.
