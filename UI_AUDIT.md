# Frontend Architecture & Integration Audit

This audit examines the component hierarchy, styling integration, and active state connections of the Code Liberators Redrob Candidate Ranker frontend.

---

## 1. Visual Regression Diagnosis: Why the Layout is Broken

**Problem**: The screenshots reveal that the sidebar, header, dashboard metrics, and pipeline visualizer are rendered as raw, unstyled HTML blocks aligned to the left of the viewport. There is no grid layout, no colors, and borders are missing.

### Core Causes
1.  **Missing CSS Import (CRITICAL)**: 
    *   `frontend/src/main.jsx` does not import `index.css`.
    *   `frontend/src/App.jsx` does not import `index.css`.
    *   *Result*: The browser loads the raw React components but has zero knowledge of the design system variables (`--color-bg-primary`, `--spacing-8`, etc.) or layouts (`.app-layout`, `.sidebar`, `.main-workspace`, `.grid-12`).
2.  **Mismatched Root Element Styles**:
    *   Because `index.css` is not loaded, the `:root` and `body` resets (e.g. `overflow: hidden`, background colors) are bypassed.

---

## 2. Component Tree & Mapping

The application has been decomposed into modular files. The current structure is as follows:

```
main.jsx (Enters app, renders StrictMode + App)
└── App.jsx (Orchestrates global state, theme, hotkeys, page routing)
    ├── Sidebar.jsx (Renders brand logo, nav buttons, live logs, developer profile)
    ├── Header.jsx (Renders search box trigger, dataset badge, theme toggler)
    ├── CommandPalette.jsx (Ctrl+K modal overlay)
    │
    └── Page Router (Renders active screen based on Sidebar selection):
        ├── Dashboard.jsx
        │   ├── MetricsCards.jsx (Top metrics cards)
        │   ├── PipelineStory.jsx (Flowchart storytelling node map)
        │   └── TopCandidatesList.jsx (Shortlist list preview)
        │
        ├── Rankings.jsx
        │   ├── CandidateTable.jsx (Grid sorting, searching, arrow-key nav)
        │   └── CandidateDrawer.jsx (Slide-over candidate profile overview)
        │
        ├── Explorer.jsx
        │   └── CandidateDrawer.jsx
        │
        ├── Compare.jsx (Side-by-side matrices comparison)
        ├── JDAnalysis.jsx (JD requirements overview)
        ├── Pipeline.jsx (Secondary Pipeline visualizer)
        ├── Diagnostics.jsx (System logs and reproducer)
        ├── Benchmark.jsx (Distribution bar charts & speeds)
        ├── ExportCsv.jsx (Download buttons)
        ├── SubmissionPackage.jsx (Team metadata details)
        └── Settings.jsx (Preferences & API URLs)
```

---

## 3. Integration Audit Matrix (Page-by-Page)

| View / Page | Layout Component | Integration State | Notes / Checks |
|---|---|---|---|
| **Shell** | `Sidebar.jsx` | ✗ Broken | Missing CSS means sidebar renders block-level at top of screen. |
| **Shell** | `Header.jsx` | ✗ Broken | Renders under the sidebar block instead of pinning to top-right. |
| **Shell** | `CommandPalette.jsx` | ✓ Wired | Opens on Ctrl+K. Layout renders once CSS variables are active. |
| **Dashboard** | `MetricsCards.jsx` | ✓ Wired | Mounted in Dashboard.jsx. |
| **Dashboard** | `PipelineStory.jsx` | ✓ Wired | Mounted. Click handlers update details panel state successfully. |
| **Dashboard** | `TopCandidatesList.jsx` | ✓ Wired | Mounted. Click switches to rankings and selects candidate. |
| **Rankings** | `CandidateTable.jsx` | ✓ Wired | Mounted. Filter dropdowns and inputs active. |
| **Rankings** | `CandidateDrawer.jsx` | ✓ Wired | Mounted. Slides in on row selection. |
| **Compare** | `Compare.jsx` | ✓ Wired | Selects Candidate A & B from loaded list, computes diffs. |
| **JDAnalysis** | `JDAnalysis.jsx` | ✓ Wired | Displays parsed required/preferred arrays. |
| **Diagnostics** | `Diagnostics.jsx` | ✓ Wired | Displays system status and reproducer shell commands. |
| **Settings** | `Settings.jsx` | ✓ Wired | Syncs Light/Dark preferences to localStorage. |

---

## 4. Spacing, Typography & Responsive Checks

*   **Grid System**: A 12-column grid (`.grid-12`) is used in `Dashboard.jsx`, `JDAnalysis.jsx`, `Diagnostics.jsx`, `Compare.jsx`, and `Benchmark.jsx`. These columns span `col-8` and `col-4` or `col-6` to utilize widescreen space.
*   **Typography**: Classes like `typography-heading-l` and `typography-label` are used across pages but remain unstyled due to missing CSS.
*   **Accessibility**: ARIA tags, visible focus indicators, and key events are defined but styling details require loaded CSS to render outline focus markers.
