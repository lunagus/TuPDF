# TuPDF

Fast, privacy-friendly PDF toolkit for the browser. Organize, split, merge, convert, and optimize PDFs with a clean, responsive UI and full internationalization.

<p align="center">
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white"></a>
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-149ECA?logo=react&logoColor=white"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://mui.com/"><img alt="MUI" src="https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white"></a>
  <a href="https://www.i18next.com/"><img alt="i18next" src="https://img.shields.io/badge/i18next-26A69A?logo=i18next&logoColor=white"></a>
  <a href="https://pdf-lib.js.org/"><img alt="pdf-lib" src="https://img.shields.io/badge/pdf--lib-0A0A0A"></a>
  <a href="https://mozilla.github.io/pdf.js/"><img alt="PDF.js" src="https://img.shields.io/badge/PDF.js-EC1C24?logo=adobeacrobatreader&logoColor=white"></a>
</p>

## Features
- **Split PDF**. Extract pages, split to ranges, or split every page.
- **Merge PDFs**. Reorder and combine multiple PDFs.
- **Organize pages**. Reorder and delete pages visually.
- **Convert pages to images**. PNG/JPG output, zipped when multiple.
- **Optimize/Compress**. Balance between quality and size.
- **Responsive UI**. Mobile-first Drawer sidebar and sticky top bar.
- **i18n**. Full internationalization with locale detection and persistence.
- **Privacy**. Processing happens in the browser via Web APIs.

## Tech stack
- Next.js, React, TypeScript
- MUI (Material UI) for components and layout
- i18next + react-i18next for translations
- pdf-lib for PDF write/manipulation; PDF.js for rendering/preview

## Supported languages
- English (en)
- Español (es)
- Deutsch (de)
- Français (fr)
- 中文 (zh)
- हिन्दी (hi)
- Português (pt)
- Italiano (it)

## Getting started
### Prerequisites
- Node.js 18+ and pnpm/npm/yarn

### Install
```bash
# using npm
npm install
# or with pnpm
pnpm install
# or with yarn
yarn
```

### Development
```bash
npm run dev
# http://localhost:3000
```

### Production build
```bash
npm run build
npm start
```

## Project structure (key parts)
- `app/` Next.js app routes (merge, split, organize, convert, optimize, recent, settings)
- `components/` UI and feature components
  - `layout/main-layout.tsx` Drawer sidebar + top bar
  - `pdf/` PDF upload, page selector, preview
  - feature workspaces under `merge/`, `split/`, `organize/`, `convert/`, `optimize/`
- `locales/<lang>/common.json` i18n dictionaries
- `lib/i18n.ts` i18next config and locale utilities

## Internationalization
- Default locale is auto-detected and saved in localStorage.
- Add/modify strings under `locales/<lang>/common.json`.
- Use `const { t } = useTranslation()` and call `t("namespace.key")` in components.

## Scripts
- `dev` start development server
- `build` production build
- `start` start production server
- `lint` run Next.js ESLint

## Notes
- PDF work happens client-side; large files may be memory-intensive in the browser.
- Some locales may fall back to English for missing strings; contributions welcome.

## Contributing
Issues and PRs are welcome. Please keep translations and accessibility in mind.

## License
Add your license here (MIT recommended).
