import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.exceptions import (
    NutriLensException,
    nutrilens_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.api.v1.users import router as users_router
from app.api.v1.food_recognition import router as food_router
from app.api.v1.nutrition import router as nutrition_router
from app.api.v1.meal_plans import router as meal_plans_router
from app.api.v1.markets import router as markets_router
from app.api.v1.shopping import router as shopping_router
from app.api.v1.assistant import router as assistant_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NutriLens Production REST API — AI Nutrition & Market Intelligence Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(NutriLensException, nutrilens_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Request ID & Timing Middleware
@app.middleware("http")
async def add_process_time_and_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Health Check Endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "production",
    }

# Mount Versioned API Routers
api_v1 = settings.API_V1_STR
app.include_router(users_router, prefix=api_v1)
app.include_router(food_router, prefix=api_v1)
app.include_router(nutrition_router, prefix=api_v1)
app.include_router(meal_plans_router, prefix=api_v1)
app.include_router(markets_router, prefix=api_v1)
app.include_router(shopping_router, prefix=api_v1)
app.include_router(assistant_router, prefix=api_v1)
