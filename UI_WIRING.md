# UI Component Wiring and Workspace Layout

This document audits the layout hierarchy, page responsibilities, routing states, and visual design tokens of the recruiter-facing candidate discovery application.

---

## 1. Global Navigation & Page Routing

The React app operates as a Single Page Application (SPA). Global page states are orchestrated in [App.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/App.jsx) and toggled via the vertical [Sidebar.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/components/layout/Sidebar.jsx).

| Tab ID | Nav Label | Target Page Component | Responsibility |
|---|---|---|---|
| `dashboard` | Dashboard | [Dashboard.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Dashboard.jsx) | Overview of candidate pool counts, top shortlisted candidates, and ensembled AI pipeline stages. |
| `rankings` | Rankings Table | [Rankings.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Rankings.jsx) | Searchable, paginated candidate table with multi-column sorting and sliding profile details drawer. |
| `explorer` | Candidate Explorer | [Explorer.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Explorer.jsx) | Grid directory layout displaying candidates in card profiles for focused qualitative candidate scanning. |
| `compare` | Compare Candidates | [Compare.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Compare.jsx) | Matrix view for side-by-side metrics matching between two selected candidates, highlighting superior signals. |
| `jd` | JD Analysis | [JDAnalysis.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/JDAnalysis.jsx) | Recruiter overview of core requirements, experience target ranges, and skill classification weights. |
| `feature_importance` | Feature Importance | [FeatureImportance.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/FeatureImportance.jsx) | Detailed chart breakdown explaining active pipeline weights and calibrating multipliers. |
| `pipeline` | Pipeline Visualizer | [Pipeline.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Pipeline.jsx) | Interactive flowchart demonstrating data flow stages from raw streaming to calibrated CSV output. |
| `diagnostics` | Diagnostics & Logs | [Diagnostics.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Diagnostics.jsx) | System specs, active model registries, and data integrity audits (no raw shell commands). |
| `export_csv` | Export CSVs | [ExportCsv.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/ExportCsv.jsx) | Download actions to fetch the verified submission CSV from the database. |
| `submission_package`| Submission Package | [SubmissionPackage.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/SubmissionPackage.jsx) | Team contact details, branch specifications, and official repository integrity validations. |
| `settings` | Settings & About | [Settings.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Settings.jsx) | Application interface theme preferences (Light/Dark mode) and active API base endpoints configuration. |

---

## 2. Component Layout Hierarchy

The application layout is structured as a vertical sidebar framework to feel like modern SaaS systems (such as Linear and Ashby):

```
div.app-layout (Flex container)
├── Sidebar (Aside navigation, system status markers, user profile badge)
└── div.main-workspace (Flex column)
    ├── Header (Command Search trigger, dataset type badge, theme toggler)
    └── main.workspace-content (Scrollable viewport)
        ├── ErrorAlert (Conditional banner for offline/blocked API notifications)
        └── [ActivePage] (Sub-page mounted based on active tab state)
```

---

## 3. Detail Views & Overlay Sheets

### Candidate Details Drawer
*   **Location**: [CandidateDrawer.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/components/rankings/CandidateDrawer.jsx)
*   **Behavior**: Slides in from the right edge on top of the active page when a candidate row is clicked in the Rankings table or an Explorer card is selected.
*   **Displays**: Anonymized Candidate ID, current title, calibrated matching score, AI matching narrative justification, bar breakdowns of title/skill/career feature weights, employment timeline history, verified skills list, notice period availability, and adversarial honeypot security status.

### Global Command Palette
*   **Location**: [CommandPalette.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/components/layout/CommandPalette.jsx)
*   **Behavior**: Opens as a modal overlay when pressing `Ctrl + K` (or `Cmd + K` on macOS).
*   **Controls**: Allows instant navigation to pages, toggling of theme, exporting CSVs, or launching profile drawer directly by typing candidate IDs.
