# Nimbus Daily Data Library

Copy these files into your project:

- `src/app/data-library/page.tsx`
- `src/components/data-library/DataLibraryView.tsx`

Then commit and push:

```bash
git add src/app/data-library/page.tsx src/components/data-library/DataLibraryView.tsx
git commit -m "feat: add Nimbus Daily data library"
git push
```

Optional sidebar link:

In `src/components/layout/Sidebar.tsx`, add this nav item after Dashboard:

```ts
{ href: "/data-library", key: "nav_data_library", icon: "â–¤" },
```

In `src/lib/translations.ts`, add:

```ts
nav_data_library: "à¸„à¸¥à¸±à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥",
```

and English:

```ts
nav_data_library: "Data Library",
```

