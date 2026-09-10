from triniai.config import MODEL_REGISTRY, settings


def test_registry_non_empty():
    assert "gemini-1.5-flash" in MODEL_REGISTRY


def test_default_model_is_registered():
    assert settings.default_model in MODEL_REGISTRY


def test_budgets_cover_all_modes():
    for mode in ("normal", "medium", "high"):
        assert settings.budgets[mode] > 0
