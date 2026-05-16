# Data-fetching hooks

A thin layer over `useEffect + axios` for the hot reads. Lives in
`src/hooks/`, backed by `src/lib/queryEvents.js`.

This is **not** React Query. It's ~50 lines that gets us 90% of the value
(invalidate-on-mutation, cancel guards, less boilerplate) without the bundle
or learning curve. Upgrade to React Query if the cache grows complex enough to
need cross-component dedup or background refetch policies.

## Anatomy

- `lib/queryEvents.js` — module-scope event bus. `invalidate(key)` notifies
  every hook subscribed to that key to refetch.
- `hooks/useQuery.js` — base hook. Wraps a fetcher with a cancel guard,
  exposes `{ data, error, loading, refetch, setData }`.
- `hooks/use<Resource>.js` — domain hooks that bind a `key` to a fetcher.

## When to add a new hook

Add a hook the moment a fetch is duplicated, OR when the data needs to live
through mutations and socket events. A good rule of thumb: if you'd write
`const [x, setX] = useState(); useEffect(() => api.get(...).then(setX), [])`
more than once, it's hook material.

## Pattern: define a key + a hook

```js
// src/hooks/useFoo.js
import api from "../api/api";
import { useQuery } from "./useQuery";

export const FOO_KEY = "foo";

export function useFoo() {
  return useQuery(FOO_KEY, () => api.get("/foo").then((r) => r.data));
}
```

Parameterised keys: derive the key from the argument so the hook re-fetches
when the parameter changes. Pass `null` to opt out (e.g. param still loading).

```js
export const fooKey = (id) => (id ? `foo:${id}` : null);

export function useFoo(id) {
  return useQuery(fooKey(id), () => api.get(`/foo/${id}`).then((r) => r.data));
}
```

## Pattern: invalidate after mutating

If the mutation is in a different component than the hook consumer (e.g. a
modal that affects a list elsewhere), call `invalidate(KEY)` after the API
call succeeds.

```js
import { invalidate } from "../lib/queryEvents";
import { MY_COMMUNITIES_KEY } from "../hooks/useCommunities";

await api.post(`/community/${id}/leave`);
invalidate(MY_COMMUNITIES_KEY); // CommunityPage refetches automatically
```

## Pattern: patch the cache directly

If the same component owns the hook AND the mutation, use `setData` to update
the cache without a refetch. Same shape as `setState`.

```js
const { data: list, setData: setList } = useFoo();

const handleDelete = async (id) => {
  await api.delete(`/foo/${id}`);
  setList((prev) => (prev ?? []).filter((x) => x._id !== id));
};
```

Socket-driven realtime updates use the same trick — patch the cache from the
incoming event payload (see [`ChannelPage.jsx`](../components/ChannelPage.jsx)
for the help-request live-update example).

## Pattern: non-React callers

Need to invalidate from an axios interceptor, a socket handler outside React,
or any plain module? `invalidate(key)` is a module-scope function with no
React dependency — just call it.

## Caveats

- No cross-component dedup: two components with the same key each fire their
  own fetch. Fine for this codebase's traffic; revisit if you mount the same
  hook on multiple visible pages.
- `loading` flips to `true` on every invalidate-driven refetch. If you want
  stale-while-revalidate UX, just keep rendering `data` while `loading` is
  true — the previous snapshot stays until the new fetch resolves.
- Errors propagate to the global toast via the axios interceptor in
  `src/api/api.js`. Hooks expose `error` for callers that want inline UI.
