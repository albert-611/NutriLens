# NutriLens Backend (FastAPI + Supabase Hybrid)

This is the Python FastAPI application backend for NutriLens.

## Setup & Local Execution

### 1. Create and Activate Virtual Environment
Using `uv` (recommended):
```bash
uv venv
.\.venv\Scripts\activate   # Windows
source .venv/bin/activate # Linux/macOS
```

Or standard Python:
```bash
python -m venv venv
.\venv\Scripts\activate
```

### 2. Install Dependencies
```bash
uv pip install -r requirements.txt
# or: pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_JWT_SECRET` are configured.

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

- **Interactive Swagger Docs:** http://localhost:8000/docs
- **ReDoc Technical Docs:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

### 5. Run Automated Tests
```bash
pytest
```
