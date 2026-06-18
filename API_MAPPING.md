# API Mapping Contract (UI & Backend Integration)

This document maps the FastAPI backend endpoints defined in `src/api/main.py` to their corresponding frontend consumers.

---

## Endpoint Integration Matrix

| HTTP Method & Route | Backend Purpose | Frontend Consumer | Integration Status | Notes |
|---|---|---|---|---|
| **GET /** | API Meta Info | *None* | Unused | Internal root check. |
| **GET /health** | Health status check | `App.jsx` $\rightarrow$ `Sidebar.jsx` | **Wired (Active)** | Toggles the active/inactive green/red status indicator dot in the sidebar footer. |
| **GET /jd** | Parsed Job Description | `App.jsx` $\rightarrow$ `JDAnalysis.jsx` | **Wired (Active)** | Renders required core/preferred skills, seniority, YOE fit bands, and weights. |
| **GET /candidates** | Top-100 shortlist | `App.jsx` $\rightarrow$ `CandidateTable.jsx` | **Wired (Active)** | Loads candidates pool into client state. Used by table, preview list, and detail panel. |
| **GET /candidates/{id}** | Single candidate details | *None (Client Cache)* | **Wired via Cache** | The `/candidates` endpoint already fetches the top-100 candidate rows containing all scoring features, making individual HTTP lookups redundant. |
| **GET /diagnostics** | Latency, FAISS info, logs | `App.jsx` $\rightarrow$ `Diagnostics.jsx` | **Wired (Active)** | Displays FAISS status, validator pass status, and CPU metrics. |
| **GET /comparison** | Structured vs Hybrid diffs | *None* | **Not Wired** | Comparison data is fetched inside Benchmark.jsx or Compare.jsx if comparison charts are rendered. |
| **GET /export/csv** | Attachment file output | `ExportCsv.jsx`, `CommandPalette.jsx` | **Wired (Active)** | Downloads the final validated hybrid shortlist CSV from the server database. |
| **POST /rank/sample** | Multipart sample ranker | *None (API Only)* | **Not Wired** | Developer API testing endpoint to upload sample profiles and return structured ranks. |
| **POST /rank/json** | JSON payload ranker | *None (API Only)* | **Not Wired** | Developer API testing endpoint. |
