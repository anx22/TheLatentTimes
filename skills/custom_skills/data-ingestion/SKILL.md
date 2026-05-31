---
name: data-ingestion
description: Strategies for managing external system fetches, RSS parsing, cron jobs, and external system integrations.
---

# Data Ingestion Skill

External data ingestion workflows are prone to chaotic payloads, timeouts, and IP unreliability.

## Ingestion Policies

1. **Isolation in Fetching**:
   - A 500 error from a single external RSS feed MUST NOT ruin the parsing of 12 other successful feeds. Use `Promise.allSettled` or individual try-catch blocks over loops.

2. **String and Schema Sanitization**:
   - RSS text often contains illegal schema encodings, un-escaped HTML, and invalid UTF sequences.
   - Always trim, slice bounds, and clean inputs prior to storing in Convex `v.string()` fields. A 5MB garbage XML string will cause DB insertion exceptions if unsupported strings are present.

3. **Timeout Guards**:
   - Use explicit `AbortController` timeouts for network requests (e.g., `fetch(url, { signal: AbortSignal.timeout(8000) })`). Do not leave open HTTP handles during batch ingestion logic, as this eats execution time on Serverless functions.

4. **Rate Limit Awareness**:
   - Do not run continuous looping ingestion without respecting cron intervals. External signals should be crawled via periodic Convex crons to avoid getting IP-blocked. 
