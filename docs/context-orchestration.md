# Context orchestration (Trini AI)

The model is not the whole system. Every request is assembled by an
orchestration layer before it reaches the LLM.

```
User message
   ↓
Language detection            src/lib/trinity/context.server.ts → detectLanguage()
   ↓
User preferences / profile    Supabase `profiles` (display_name, language, bio)
   ↓
Relevant memory (RAG)         Supabase `memories`, ranked against the question
   ↓
Conversation history          UI messages → model messages
   ↓
System + safety instructions  SYSTEM_PROMPT + SAFETY_RULES
   ↓
Tools / external data         Agent Kernel tool layer (agents module, MCP)
   ↓
LLM reasoning                 Agent Kernel: compile → plan → harness → verify
   ↓
Response generation
   ↓
Language + tone adaptation    "answer in <target language>", match tone
   ↓
Final answer
```

## Language handling

`detectLanguage()` recognises Tamil, Sinhala, Hindi, Arabic, Chinese, Japanese,
Korean, Russian by script, plus romanised Tamil/Sinhala by common keywords, so a
mixed message such as `JavaScript function epdi work aaguthu explain pannunga`
is answered in Tamil. An explicit request ("explain in Tamil") always wins, then
the profile language, then the detected language.

## Selective personalization

Only memories that score against the current question are attached — never the
whole memory table. Ranking lives in `src/lib/trinity/rag.server.ts`
(lexical overlap × importance, top 8).

## Where it is used

- `POST /api/chat` — both the Agent Kernel auto path and explicit-model paths.
- `POST /api/agents/chat` — built-in kernel and the remote Agent Kernel body.

The assembled block is passed as `KernelContext.block` and injected by
`personalization()` in `src/lib/trinity/kernel/prompts.server.ts`.

## Models

Primary model is **GLM 5.3** (`z-ai/glm-5.3` via OpenRouter), first in the
Agent Kernel reasoning, fast and code chains. Missing provider keys degrade
gracefully to the Lovable AI gateway.
