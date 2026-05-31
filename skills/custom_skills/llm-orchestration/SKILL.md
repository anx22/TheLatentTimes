---
name: llm-orchestration
description: Guidelines for GenAI pipeline integration, autonomous personas, and model behavior stability.
---

# LLM Orchestration Skill

Complex multi-agent interaction systems (e.g., Scout, Board, Columnist) require extreme resilience. Silent fails in background threads mean the user never sees results.

## Agent System Imperatives

1. **Zero Tolerance for Swallowed LLM Exceptions**:
   - Never use empty `catch (err) { }` blocks around `GoogleGenAI` content generation.
   - If an API key is missing, or the model throws an unsupported parameter exception, **stop execution** and `throw new Error(...)` loudly so the overarching orchestrator fails the pipeline gracefully and logs the event for to the user.

2. **Model Naming Conventions**:
   - Use current and valid model aliases ONLY.
   - Example: Default to `gemini-3-flash-preview` or `gemini-2.5-pro`.
   - Do not hallucinate model endpoints (e.g., `gemini-3.5-flash` will cause terminal 404s in some SDK variants).

3. **Structured Outputs**:
   - When asking for JSON, always pass `responseMimeType: "application/json"`.
   - Do not trust standard markdown parsing if strict object arrays are expected—enforce the schema strictly in the system prompt.
   - Reference exact Unique Identifiers: For tasks that require aggregating sub-records (like clustering signals), firmly instruct the model to use the EXACT string IDs from the ingested payload.

4. **Stateless Pipelines**:
   - Ensure that LLM action wrappers do not rely on in-memory persistence. Actions must compute stateless completions and deposit them directly back into the Convex backend.
