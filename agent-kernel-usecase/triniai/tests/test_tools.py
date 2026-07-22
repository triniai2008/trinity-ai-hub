import pytest

from triniai.tools import TOOLS


def test_all_tools_registered():
    for expected in ("web_search", "fetch_url", "remember", "recall", "list_models"):
        assert expected in TOOLS


@pytest.mark.asyncio
async def test_remember_and_recall_roundtrip():
    ctx = {"user_id": "u-1"}
    await TOOLS["remember"].handler({"key": "color", "value": "blue"}, ctx)
    got = await TOOLS["recall"].handler({"key": "color"}, ctx)
    assert got["value"] == "blue"


@pytest.mark.asyncio
async def test_list_models_returns_registry():
    out = await TOOLS["list_models"].handler({}, {"user_id": "u"})
    assert out["models"]
