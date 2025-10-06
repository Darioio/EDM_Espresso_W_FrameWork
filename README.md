# ShopifyEDM

## Product Description Extraction

When a product URL is fetched via `GET /api/product?url=...`, the backend scrapes the product page and populates several description-related fields:

- `metadataDescription`: Only the exact contents of the HTML `<meta name="description" />` tag. (Previously this may have mixed in Open Graph / Twitter / JSON‑LD fallbacks.)
- `originalMetadataDescription`: Immutable snapshot of the original `<meta name="description">` captured at parse time; used to restore if the working `metadataDescription` is cleared/edited and the user switches sources back to Metadata.
- `description`: Defaults to the meta description if present; otherwise falls back to structured data (`ld+json` Product.description), then `og:description`, then `twitter:description`.
- `descriptionP`: First `<p>` inside a `.product__description` container (if present)
- `descriptionUl`: First `<ul>` inside a `.product__description` container, preserved as HTML

The active description shown/edited in the UI is controlled by `descSource` (`metadata` | `p` | `ul`). Switching sources rewrites `product.description` accordingly without mutating the original stored variants.

This behavior ensures the “metadata description” field always maps 1:1 with what a merchant set in their page head, while still providing rich fallbacks for marketing content.

## Resetting / Starting a New EDM

From the preview screen, the floating action button (SpeedDial) includes a "Build New EDM" action. Confirming the reset triggers a comprehensive state clear via an internal `resetAllState` helper. The following are reset:

- Body sections, their URLs, products, paddings, ordering
- Hero & Banner (templates selection, images, alt/href, HTML, edit/new/draft state, padding)
- Header, Body, Footer generated HTML fragments + final compiled HTML
- Brand data (URL, name, colours, font, announcement, logo, derived summary)
- Auto‑generation guard so the first product will auto-generate again after a new URL submit
- All template edit/create draft fields (but custom templates stored in `localStorage` persist)
- View mode, open accordion, selection context, snackbar message, section add menu

After reset the landing form (URL prompt) is shown again and the user can paste a new product or collection URL.

## Testing

Jest with `jsdom` + React Testing Library is configured.

Key test files:
- `tests/updateProduct.test.ts` – unit tests for product description source switching logic.
- `tests/resetAllState.test.tsx` – integration-style test that mocks network calls, submits a URL, triggers a reset, and verifies the landing prompt returns.

### Run Tests

```
npm test
```

The test script also runs type checking and ESLint before executing Jest.

### Adding More Tests

When adding tests that depend on network calls, mock `global.fetch` inside the test (see `resetAllState.test.tsx`). Keep responses minimal—only include fields the component actually reads.

## Development Commands

```
npm run dev       # Start Next.js in development
npm run build     # Production build
npm start         # Start production server (after build)
npm run lint      # Lint
npm run typecheck # TypeScript only
npm test          # Typecheck + lint + Jest
```

## Custom Templates Persistence

User-added templates (body, header, footer, banner, hero) are persisted in `localStorage` (`custom*Templates` keys). A reset does not remove them; only in-memory selections and drafts are cleared. To fully wipe, clear browser storage.

## Future Improvements (Ideas)

- Extract EDM composition state to a dedicated hook for cleaner component separation.
- Add snapshot tests or visual regression on generated HTML.
- Provide a lightweight CLI script to export compiled EDM HTML for a set of product URLs.
- Optional persistence of last-used brand colors across resets (opt-in toggle).