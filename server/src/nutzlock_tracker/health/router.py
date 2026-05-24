from fastapi import APIRouter, status

from nutzlock_tracker.health.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["system"])


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check API health",
)
async def read_health() -> HealthResponse:
    return HealthResponse(service="nutzlock-tracker-api", status="ok")

