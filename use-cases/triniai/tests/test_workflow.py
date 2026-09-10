import pytest

from triniai import workflow
from triniai.workflow import ChatRequest


def test_pick_models_normal():
    picks = workflow._pick_models("normal", None)
    assert len(picks) == 1


def test_pick_models_medium():
    picks = workflow._pick_models("medium", None)
    assert 1 <= len(picks) <= 3


def test_pick_models_high():
    picks = workflow._pick_models("high", None)
    assert len(picks) >= 1


def test_explicit_model_wins():
    picks = workflow._pick_models("high", "gemini-1.5-pro")
    assert picks == ["gemini-1.5-pro"]


@pytest.mark.asyncio
async def test_run_errors_without_core(monkeypatch):
    """Without agent_kernel installed, workflow.run should raise cleanly."""
    monkeypatch.setattr(workflow, "Agent", None)
    monkeypatch.setattr(workflow, "Message", None)
    events = []
    with pytest.raises(RuntimeError):
        async for ev in workflow.run(
            ChatRequest(messages=[{"role": "user", "content": "hi"}])
        ):
            events.append(ev)
