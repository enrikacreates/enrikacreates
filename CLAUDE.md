# enrikacreates

## Build locally before pushing

Before any `git push` or `vercel deploy`, run the project's build (`npm run build`, or the equivalent for its package manager) and make sure it passes. Every push to `main` triggers a paid Vercel build, and failed builds still burn build minutes, so catch errors locally first.

- If the build fails, fix it before pushing. Don't push "to see if Vercel builds it."
- Batch related commits and push once, rather than pushing after every small change.

## Weekly release flow (dev branch)

This app ships to production once a week, on Mondays. Day-to-day work happens on `dev`.

- Commit and push to `dev` (or a feature branch), never directly to `main`. Pushes to anything but `main` do not build on Vercel.
- Don't merge into `main` or run `vercel --prod` unless the user explicitly asks for a release.
- Releases go out with `~/dev/release-week`, which builds each app locally and fast-forwards `main` to `dev`.
