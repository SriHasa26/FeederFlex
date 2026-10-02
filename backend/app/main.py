"""
FeederFlex backend -- FastAPI application entrypoint.

SIMULATION / DEMONSTRATION SYSTEM ONLY. This backend is a read-only API over the validated
Phase 4-9 research pipeline. It never writes to phase3_data/, never re-runs any simulation, and
exposes no live-control endpoint (see docs/PHASE10_API_SPEC.md's "no control endpoints" rule).
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, feeder, forecast, flexibility, topology, scenarios, research
from app.core.config import APP_TITLE, APP_VERSION, CORS_ORIGINS
from app.services.data_loader import store


@asynccontextmanager
async def lifespan(app: FastAPI):
    store.load()
    yield


app = FastAPI(title=APP_TITLE, version=APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True,
    allow_methods=["GET"], allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(feeder.router)
app.include_router(forecast.router)
app.include_router(flexibility.router)
app.include_router(topology.router)
app.include_router(scenarios.router)
app.include_router(research.router)
