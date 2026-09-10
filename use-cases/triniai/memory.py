"""Optional long-term memory backed by Turso (libSQL).

Falls back to an in-process dict when TURSO_URL is unset so tests and local
runs work without infrastructure.
"""
from __future__ import annotations

from typing import Protocol

from .config import settings


class MemoryStore(Protocol):
    async def remember(self, user_id: str, key: str, value: str) -> None: ...
    async def recall(self, user_id: str, key: str) -> str | None: ...
    async def list_keys(self, user_id: str) -> list[str]: ...


class InMemoryStore:
    def __init__(self) -> None:
        self._data: dict[tuple[str, str], str] = {}

    async def remember(self, user_id: str, key: str, value: str) -> None:
        self._data[(user_id, key)] = value

    async def recall(self, user_id: str, key: str) -> str | None:
        return self._data.get((user_id, key))

    async def list_keys(self, user_id: str) -> list[str]:
        return [k for (u, k) in self._data if u == user_id]


class TursoStore:
    def __init__(self, url: str, token: str) -> None:
        # Imported lazily so the dependency is optional.
        import libsql_client  # type: ignore

        self._client = libsql_client.create_client(url=url, auth_token=token)

    async def remember(self, user_id: str, key: str, value: str) -> None:
        await self._client.execute(
            "INSERT INTO memories(user_id,key,value) VALUES (?,?,?) "
            "ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value",
            [user_id, key, value],
        )

    async def recall(self, user_id: str, key: str) -> str | None:
        rs = await self._client.execute(
            "SELECT value FROM memories WHERE user_id=? AND key=? LIMIT 1",
            [user_id, key],
        )
        return rs.rows[0][0] if rs.rows else None

    async def list_keys(self, user_id: str) -> list[str]:
        rs = await self._client.execute(
            "SELECT key FROM memories WHERE user_id=?", [user_id]
        )
        return [r[0] for r in rs.rows]


def build_store() -> MemoryStore:
    if settings.turso_url and settings.turso_token:
        return TursoStore(settings.turso_url, settings.turso_token)
    return InMemoryStore()


store: MemoryStore = build_store()
