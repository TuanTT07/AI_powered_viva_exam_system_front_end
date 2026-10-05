# Performance

## Priorities

1. Viva interaction latency
2. Fast route transitions
3. Avoid unnecessary refetching
4. Keep large reports/tables efficient
5. Avoid loading all exam evidence eagerly

## Rules

- lazy-load large route modules where practical,
- paginate/filter large datasets server-side,
- avoid duplicated server caches,
- memoize only when measured or clearly useful,
- avoid oversized dependencies for trivial utilities.

## Viva

Do not let decorative UI work block:
- microphone controls,
- transcript updates,
- reconnect handling.

## Measurement

Track later:
- route load time,
- API latency,
- realtime reconnect time,
- transcript finalization latency,
- AI follow-up perceived latency.
