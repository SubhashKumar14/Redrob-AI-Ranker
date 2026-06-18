# API Endpoint Integration Matrix

This document defines the contract between the FastAPI Python backend application and the Vite React frontend consumers.

---

## 1. Endpoint Wiring Grid

All API calls are relative to `API_BASE` (which defaults to `/api` proxy routing, bypassing cross-origin blocks).

| HTTP Method & Route | Backend Endpoint | Frontend Consumer Component | State Integration Role |
|---|---|---|---|
| **GET /health** | `health_check()` | [App.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/App.jsx) $\rightarrow$ [Sidebar.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/components/layout/Sidebar.jsx) | Toggles the active status indicator dot in the sidebar footer (Healthy vs Disconnected) and sets the `apiOnline` state. |
| **GET /jd** | `get_jd()` | [App.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/App.jsx) $\rightarrow$ [JDAnalysis.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/JDAnalysis.jsx) | Returns parsed core roles, target seniority, preferred YOE fit bands, skills arrays, and scoring weights list. |
| **GET /candidates** | `get_candidates()` | [App.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/App.jsx) $\rightarrow$ [CandidateTable.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/components/rankings/CandidateTable.jsx) | Returns the pre-ranked top-100 candidates from the locked CSV. Enriched on-the-fly using `top100_details.json` to load actual profile features. |
| **GET /candidates/{id}** | `get_candidate_detail()` | *None (Client-Side Cache)* | Optional lookup for specific candidate details. Client state handles drawer selection directly from the enriched candidates list. |
| **GET /diagnostics** | `get_diagnostics()` | [App.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/App.jsx) $\rightarrow$ [Diagnostics.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Diagnostics.jsx) | Returns FAISS status, vector index sizes, processor limits, and execution logs validator checklist state. |
| **GET /comparison** | `get_comparison()` | [Benchmark.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/Benchmark.jsx) | Fetches overlaps counts, average rank shifts, and score diffs between structured baseline and hybrid calibrated shortlists. |
| **GET /export/csv** | `export_csv()` | [ExportCsv.jsx](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/src/pages/ExportCsv.jsx) | Triggered via `window.open` download actions to fetch and download the final submission CSV file. |
| **POST /rank/sample** | `rank_sample()` | *Internal Developer CLI* | Multipart file uploader for ranking custom sample profiles. |
| **POST /rank/json** | `rank_json()` | *Internal Developer CLI* | Uploader for custom profile files returning raw JSON lists. |

---

## 2. Same-Origin Request Proxy Setup

To eliminate browser-dependent cross-origin request failures and ensure robust connectivity across different user clients, the following same-origin proxy configurations have been implemented:

1.  **Vercel Reverse Proxy Rewrites**: In [vercel.json](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/vercel.json), all requests on the production domain `/api/*` are reverse-proxied at Vercel's edge router directly to the Render server:
    ```json
    {
      "rewrites": [
        {
          "source": "/api/:path*",
          "destination": "https://redrob-ai-ranker.onrender.com/:path*"
        }
      ]
    }
    ```
2.  **Dev Proxy Rewrites**: In [vite.config.js](file:///c:/Projects/CandidateDiscovery&Ranking/code_liberators/frontend/vite.config.js), a matching server proxy rewrites local relative `/api/*` calls to the local python uvicorn port (`http://localhost:8000`).
3.  **Unified Relative Requests**: The frontend uses `/api` as its base URL, making all calls same-origin requests.
