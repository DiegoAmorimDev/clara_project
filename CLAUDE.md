# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint      # run ESLint
```

## Project Overview

A single-page Valentine's Day gift site themed around the anime **Sousou no Frieren**. It is a linear, multi-screen experience with background music and a memory matching game.

**Stack:** React 19 + Vite + Tailwind CSS 3. No router — screen state is managed with a single `useState` in `App.jsx`.

## Architecture

All application code lives in `src/App.jsx`. There are no separate component files. The app has five screens rendered conditionally:

| State value | Screen |
|---|---|
| `welcome` | Intro / call-to-action |
| `quiz` | 4-question quiz |
| `quiz-result` | Quiz score summary |
| `memory` | Memory matching card game |
| `letter` | Love letter (final screen) |

Screen transitions are driven by `setScreen(...)` passed down as `onFinish`/`onContinue` props.

## Key Details

- **Styling:** mix of Tailwind utility classes and inline `style` props. Global CSS keyframes (`twinkle`, `spin-slow`, `fadeIn`, `slideUp`) are injected via a `<style>` block inside `App`. `App.css` is intentionally empty; all real styles are in `index.css` or inline.
- **Static assets:** images (`/ano_novo.jpeg`, `/na_praça.jpeg`, etc.) and the background music (`/frieren.mp3`) are served from `public/`. The audio element is mounted once in `App` and persists across screens.
- **Memory game deck:** built from `MEMORY_CARDS` array, duplicated into pairs and shuffled on mount via `buildDeck()`.
- **Quiz answers:** the `answer` field in `QUIZ_QUESTIONS` is a zero-based index into the `options` array.
- **Fonts:** Playfair Display (headings) and Inter (body) loaded from Google Fonts in `index.css`.
