from nutzlock_tracker.rules.constants import (
    DEFAULT_CLAUSES,
    DEFAULT_DEATH_PROPAGATION_MODE,
    DEFAULT_LEVEL_CAP_SOURCE,
    DEFAULT_STANDARD_RULES,
)
from nutzlock_tracker.rules.models import Ruleset


def build_default_ruleset(run_id: str, ruleset_id: str) -> Ruleset:
    return Ruleset(
        clauses=dict(DEFAULT_CLAUSES),
        custom_rules=[],
        death_propagation_mode=DEFAULT_DEATH_PROPAGATION_MODE,
        id=ruleset_id,
        level_cap_enabled=True,
        level_cap_source=DEFAULT_LEVEL_CAP_SOURCE,
        run_id=run_id,
        standard_rules=DEFAULT_STANDARD_RULES,
    )
