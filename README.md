<<<<<<< HEAD
# TuPDF

Fast, privacy-friendly PDF toolkit for the browser. Organize, split, merge, convert, and optimize PDFs with a clean, responsive UI and full internationalization.
=======
# 📃 TuPDF
>>>>>>> d5eba03866949090759ce6f51fe1493b6b89e103

<p align="center">
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white"></a>
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-149ECA?logo=react&logoColor=white"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://mui.com/"><img alt="MUI" src="https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white"></a>
  <a href="https://www.i18next.com/"><img alt="i18next" src="https://img.shields.io/badge/i18next-26A69A?logo=i18next&logoColor=white"></a>
  <a href="https://pdf-lib.js.org/"><img alt="pdf-lib" src="https://img.shields.io/badge/pdf--lib-0A0A0A"></a>
  <a href="https://mozilla.github.io/pdf.js/"><img alt="PDF.js" src="https://img.shields.io/badge/PDF.js-EC1C24?logo=adobeacrobatreader&logoColor=white"></a>
</p>

<<<<<<< HEAD
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
=======
---

## 🚀 Overview

**TuPDF** is a lightweight, open-source PDF toolkit designed for modern browsers.  
All operations — from splitting to optimizing — run entirely on the client using Web APIs, ensuring **speed, privacy, and zero server dependencies**.

---

## ✨ Features

### 🧩 Split PDFs  
Easily divide a PDF into multiple files:  
- Extract specific **page ranges** or individual pages.  
- Split every page into separate files with one click.  
- Preview pages before splitting, ensuring precise extraction.  
- Client-side splitting — no data leaves your browser.

### 🔗 Merge PDFs  
Combine multiple PDFs into one clean document:  
- Upload, reorder, and preview files before merging.  
- Merge seamlessly using **pdf-lib**, preserving quality and metadata.  
- Drag-and-drop interface for intuitive document organization.  
- No upload limits, as everything runs locally.

### 🗂️ Organize Pages  
Visually edit your PDF structure:  
- Rearrange, rotate, or delete pages using a responsive grid view.  
- Instant visual feedback with live thumbnails (powered by **PDF.js**).  
- Perfect for cleaning up scans or reordering reports before submission.

### 🖼️ Convert Pages to Images  
Transform your PDFs into image files for sharing or web use:  
- Export as **PNG** or **JPG**.  
- Multi-page PDFs automatically bundled into a **ZIP**.  
- Adjustable DPI and scaling options (in development).  
- Great for previews, thumbnails, and online document sharing.

### ⚙️ Optimize & Compress  
Reduce file size without losing clarity:  
- Smart compression balancing **image quality** and **file weight**.  
- Ideal for email attachments or web uploads.  
- Preview before and after compression.  
- Runs entirely in your browser, preserving confidentiality.

### 📱 Responsive, Modern UI  
Designed with accessibility and usability in mind:  
- **Mobile-first layout** with adaptive drawer and sticky toolbar.
- **Dark-mode** available, choose between two different styles.
- Built with **MUI (Material UI)** for a clean, consistent design.  
- Keyboard and touch support for effortless use across devices.

### 🌍 Full Internationalization (i18n)  
Seamlessly localized experience:  
- UI available in **8 languages** (English, Spanish, French, German, Chinese, Hindi, Portuguese, Italian).  
- Automatic locale detection with persistence via `localStorage`.  
- Easy to contribute new translations through `locales/<lang>/common.json`.

### 🔒 100% Privacy-Friendly  
Your documents never leave your computer:  
- All operations — from upload to export — happen **entirely client-side**.  
- No servers, APIs, or cloud processing.  
- Built with **privacy-by-design**, suitable for sensitive documents and offline use.

### ⚡ Performance-Focused  
Optimized for large PDFs and fast rendering:  
- Leverages **Web Workers** and efficient memory handling.  
- Incremental rendering with **PDF.js** for smooth previews.  
- Tested on files exceeding 100 MB for stability and performance.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | [Next.js](https://nextjs.org/) + [React](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| UI Components | [MUI](https://mui.com/) (Material UI) |
| Internationalization | [i18next](https://www.i18next.com/) + react-i18next |
| PDF Processing | [pdf-lib](https://pdf-lib.js.org/) for editing, [PDF.js](https://mozilla.github.io/pdf.js/) for rendering |

---

## 🌐 Supported Languages

| Code | Language |
|------|-----------|
| en | English |
| es | Español |
| de | Deutsch |
| fr | Français |
| zh | 中文 |
| hi | हिन्दी |
| pt | Português |
| it | Italiano |

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** ≥ 18  
- **Package manager:** npm, pnpm, or yarn

### Installation
```bash
# Using npm
npm install

# Or using pnpm
pnpm install

# Or using yarn
yarn
>>>>>>> d5eba03866949090759ce6f51fe1493b6b89e103

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

<<<<<<< HEAD
## Project structure (key parts)
=======
## 🗂️ Project Structure
>>>>>>> d5eba03866949090759ce6f51fe1493b6b89e103
- `app/` Next.js app routes (merge, split, organize, convert, optimize, recent, settings)
- `components/` UI and feature components
  - `layout/main-layout.tsx` Drawer sidebar + top bar
  - `pdf/` PDF upload, page selector, preview
  - feature workspaces under `merge/`, `split/`, `organize/`, `convert/`, `optimize/`
- `locales/<lang>/common.json` i18n dictionaries
- `lib/i18n.ts` i18next config and locale utilities

<<<<<<< HEAD
## Internationalization
=======
## 🌍 Internationalization
>>>>>>> d5eba03866949090759ce6f51fe1493b6b89e103
- Default locale is auto-detected and saved in localStorage.
- Add/modify strings under `locales/<lang>/common.json`.
- Use `const { t } = useTranslation()` and call `t("namespace.key")` in components.

<<<<<<< HEAD
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
=======
## ⚠️ Notes
- PDF work happens client-side; large files may be memory-intensive in the browser.
- Some locales may fall back to English for missing strings; contributions welcome.
>>>>>>> d5eba03866949090759ce6f51fe1493b6b89e103
