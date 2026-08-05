# Structure

- Monorepo with a shared library consumed by both the mobile and web apps, allowing business logic to be written once and reused across platforms.
- Co-locating the mobile and web apps in the same repo enables coordinated releases and parallel feature development across both platforms.

# Trade-offs

- Shared library may introduce a complexity to the repo, for example, if the webside wants to continue using v1 api, however the mobile wants to use v2 api, we need to write a new hook, like useReadLaterV2().
- Network error handling uses a 3-retry strategy, but on mobile we should check device connectivity before retrying to avoid wasting battery and time on a known offline state.
- Next.js was chosen as the web framework because server-side rendering improves performance and makes content crawlable by search engines, which is important for a media-heavy product.
- Offline article cache is not yet implemented; currently articles are fetched on demand. Pre-fetching saved articles into an offline store (IndexedDB on web, SQLite on mobile) would significantly improve the reading experience.

# Testing

- Network latency was tested manually. The 3-retry timeout logic is difficult to exercise in automated tests because it depends on real elapsed time; this can be improved by introducing a configurable timeout via an environment variable or a test-only flag.

# Not done / next

- Unit tests for the UI components
- e2e testing
- CI/CD pipeline
- Dockerise the web app

# AI use

- AI was used to implement the majority of features. In cases where the initial output was unsatisfactory, refining the prompt consistently produced better results than iterating on a poor first draft.
