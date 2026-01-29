# AI Service Structure

This directory contains the logic for the Local AI Tutor using Ollama and LangChain.

## Directories
- **chains/**: Contains LangChain runnable chains (e.g., Q&A chain, Summary chain).
- **prompts/**: Stores template files for system prompts.
- **vectors/**: Logic for vector store management (HNSW or In-memory).

## Files
- **aiService.js**: Main entry point for the rest of the backend to interact with AI.
- **ragPipeline.js**: (Pending) Core logic for document split & retrieval.

## Setup
Ensure `OLLAMA_URL` is set in `.env` (default: `http://localhost:11434`).
Model used: `qwen2.5:1.5b`.
