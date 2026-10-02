from fastapi import APIRouter

from app.schemas.models import EvaluationResult, EvidenceResponse, EvidenceClaim, LimitationsResponse, LimitationItem
from app.services.data_loader import store
from app.services.research_content import EVIDENCE_CLAIMS, LIMITATIONS

router = APIRouter(prefix="/api", tags=["research"])


@router.get("/results", response_model=EvaluationResult)
def get_results():
    """Direct, unmodified pass-through of Phase 9's own validated evaluation JSON files."""
    return EvaluationResult(
        baseline=store.baseline_evaluation,
        counterfactual=store.counterfactual_evaluation,
        restoration_and_duration=store.restoration_and_duration_analysis,
        failure_modes=store.failure_mode_analysis,
        statistical_summary=store.statistical_summary,
        fairness=store.fairness_metrics,
    )


@router.get("/evidence", response_model=EvidenceResponse)
def get_evidence():
    supported = [EvidenceClaim(**c) for c in EVIDENCE_CLAIMS if c["supported"].startswith("Supported")]
    conditional = [EvidenceClaim(**c) for c in EVIDENCE_CLAIMS if c["supported"] == "Conditionally supported"]
    not_established = [EvidenceClaim(**c) for c in EVIDENCE_CLAIMS if c["supported"] == "NOT ESTABLISHED"]
    return EvidenceResponse(supported=supported, conditional_counterfactual=conditional, not_established=not_established)


@router.get("/limitations", response_model=LimitationsResponse)
def get_limitations():
    return LimitationsResponse(items=[LimitationItem(**item) for item in LIMITATIONS])
