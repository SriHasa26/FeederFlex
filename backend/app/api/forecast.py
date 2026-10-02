from fastapi import APIRouter, Query

from app.schemas.models import ForecastPoint, ForecastResponse, RenewablePoint, RenewableResponse
from app.services.data_loader import store

router = APIRouter(prefix="/api", tags=["forecast"])


@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(limit: int = Query(200, le=500)):
    df = store.load_forecast_h1h.head(limit)
    points = [
        ForecastPoint(
            forecast_origin_timestamp=str(row.forecast_origin_timestamp),
            target_timestamp=str(row.target_timestamp), horizon_hours=int(row.horizon_hours),
            actual_load_w=row.actual_load_w, persistence_pred_w=row.persistence_pred_w,
            linear_regression_pred_w=row.linear_regression_pred_w, xgboost_pred_w=row.xgboost_pred_w,
        )
        for row in df.itertuples()
    ]
    h1 = store.load_forecast_comparison[store.load_forecast_comparison["horizon_hours"] == 1]
    mae_by_model = {row.model: float(row.mae) for row in h1.itertuples()}
    return ForecastResponse(points=points, model_comparison_mae_w=mae_by_model)


@router.get("/renewable", response_model=RenewableResponse)
def get_renewable(limit: int = Query(500, le=2500)):
    df = store.pv_availability_normalized.head(limit)
    points = [
        RenewablePoint(timestamp=str(row.timestamp_local), pv_availability_normalized=row.pv_availability_normalized,
                        ghi_wm2=row.ghi_wm2)
        for row in df.itertuples()
    ]
    return RenewableResponse(points=points)
