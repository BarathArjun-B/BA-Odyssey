# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Phase 2 Backend Architecture Design documentation (`backend/ARCHITECTURE.md`, `backend/DATABASE.md`, `backend/API.md`).

### Changed
- **Stack Override**: Backend stack updated from Python/FastAPI to Node.js/Express/TypeScript (MERN stack).
- Updated `CLAUDE.md` and `docs/PHASE_1_FRONTEND_ANALYSIS.md` to reflect the new Node.js/Express stack.
- Collection naming convention established as `snake_case` plural (e.g., `users`, `problems`, `ideas`).
- Validation strategy updated to use Zod instead of Pydantic.
