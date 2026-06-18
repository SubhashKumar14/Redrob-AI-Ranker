# Design System — Code Liberators Visual Identity

This document defines the visual system, branding assets, and code guidelines for the **Code Liberators Redrob AI Candidate Ranker** dashboard.

---

## 1. Brand Concept: The Refinement Prism

The brand logo is based on **The Refinement Prism (Split Diamond)**. It represents the process of taking a massive pool of unstructured candidate data (100,000+ records) and cleanly refining and filtering it down to the absolute top candidates using objective, multi-stage scoring criteria.

*   **Geometry**: A perfect geometric diamond split by a diagonal gap.
*   **Aesthetics**: Flat, vector-first, minimal outline.
*   **Colors**: Primary Indigo (`#6366f1`) and Light Indigo (`#818cf8`).

---

## 2. Color Tokens: Pure Slate & Charcoal

The color palette is designed to follow modern, high-contrast B2B enterprise dashboards (e.g., Linear, Vercel). Accent colors are used in less than 10% of the viewport to minimize visual noise.

| Token | CSS Variable | Hex Value | Purpose |
|---|---|---|---|
| Primary Background | `--color-bg-primary` | `#0b0f17` | Near-black workspace canvas |
| Surface Background | `--color-bg-surface` | `#121824` | Sidebar and panels |
| Card Background | `--color-bg-card` | `#192030` | Interactive card nodes |
| Border Color | `--color-border` | `#252e42` | Cool slate boundaries |
| Border Hover | `--color-border-hover` | `#34405a` | Focus states |
| Text Primary | `--color-text-primary` | `#f1f5f9` | Off-white body & headings |
| Text Secondary | `--color-text-secondary` | `#94a3b8` | Muted labels |
| Brand Accent | `--color-accent` | `#6366f1` | Focus borders, active tabs |
| Success Signal | `--color-success` | `#10b981` | Pass status & calibrations |
| Warning Signal | `--color-warning` | `#f59e0b` | Warnings |
| Error Signal | `--color-error` | `#f43f5e` | Failures / offline alerts |

---

## 3. Spacing System

To maintain consistent layouts and alignments, all margins, padding, and layout gaps follow a strict 8-point base grid:

*   `--spacing-4`: `4px` (Very small details, badge offsets)
*   `--spacing-8`: `8px` (Small padding, gap inside list items)
*   `--spacing-12`: `12px` (Standard element gap)
*   `--spacing-16`: `16px` (Card inner margins, input paddings)
*   `--spacing-24`: `24px` (Main grid gap, layout padding)
*   `--spacing-32`: `32px` (Page boundaries padding)
*   `--spacing-48`: `48px` (Hero offsets, page section separations)

---

## 4. Typography Scale

Typography uses the **Inter** font family (with system fallbacks) for high readability in dense data tables:

*   **Display**: `2.25rem` (line-height: `1.15`, weight: `800`, letter-spacing: `-0.04em`)
*   **Heading XL**: `1.75rem` (line-height: `1.2`, weight: `800`, letter-spacing: `-0.03em`)
*   **Heading L**: `1.4rem` (line-height: `1.25`, weight: `700`, letter-spacing: `-0.02em`)
*   **Heading M**: `1.1rem` (line-height: `1.3`, weight: `600`, letter-spacing: `-0.01em`)
*   **Heading S**: `0.95rem` (line-height: `1.35`, weight: `600`)
*   **Body L**: `1rem` (line-height: `1.5`, weight: `400`)
*   **Body M**: `0.85rem` (line-height: `1.5`, weight: `400`)
*   **Body S**: `0.78rem` (line-height: `1.45`, weight: `400`)
*   **Caption**: `0.72rem` (line-height: `1.4`, weight: `500`, color: secondary)
*   **Label**: `0.7rem` (line-height: `1.2`, weight: `600`, uppercase, spacing: `0.08em`)

---

## 5. Motion Tokens

Transitions are kept lightweight and instantaneous. No bouncy or spring-based curves.

*   `--motion-hover`: `120ms` (Interactive hover outlines, buttons)
*   `--motion-drawer`: `160ms` (Slide-over details panel from right)
*   `--motion-sidebar`: `180ms` (Sidebar nav item highlight swaps)
*   `--motion-modal`: `200ms` (Ctrl+K Command Palette scale-in)
