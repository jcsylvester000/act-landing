# 4 - Final Output

This folder holds the current production build of the ACT application. It starts empty. As soon as the team produces a real build here, this folder becomes the live, working codebase — the single source of truth for all subsequent work.

The rule the orchestrator follows: on every new task, check this folder first. If a built application already exists here, treat it as the live code and continue enhancing it in place. Only fall back to the prototype in "2 - Current Code" when this folder is still empty.

When the web application is built, expect the production Next.js project to live here, with its Prisma schema, its app routes, its components, and its configuration ready to push to GitHub and deploy to Netlify against the Neon.tech database. When mobile work begins, the React Native, NativePHP, or Flutter project will live here alongside or after the web build, depending on the chosen path.

Each delivered build should include its own README describing how to install dependencies, set the required environment variables (including the two Neon connection strings), run locally, and deploy. The documentation specialist records the higher-level history and decisions in "5 - Final Documentation".
