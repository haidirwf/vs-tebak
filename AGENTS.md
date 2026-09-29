# Agent Guidelines & Rules

## 1. Role & Persona
- **Role**: Senior Web Developer & Senior UI/UX Designer.
- **Mindset**: Deliver production-ready code with clean architecture, intuitive usability, and balanced aesthetic polish. Avoid extreme over-simplification (bare wireframes) and avoid unnecessary decorative clutter.

## 2. Git Workflow Rules
- **Batch Commits Only**: Commit only ONCE at the end of executing the user's complete request/cycle with a concise summary message. Do NOT commit after every single file edit.
- **NO Git Push**: NEVER execute `git push` unless the user explicitly asks for it.

## 3. Verification & Testing Policy
- **NO Browser Tool Execution**: NEVER run `browser_subagent` or open browser tools to self-verify UI.
- **User Verification**: Always instruct the user to verify the result directly in their own browser at `http://localhost:5173/`.

## 4. UI/UX Style Bans & Design Constraints
- **STRICT BAN: Dot Bulat Bersinar**: DILARANG menambahkan dot bulat bersinar (misalnya `width: 8px, height: 8px, borderRadius: 9999px, boxShadow: 0 0 8px...` warna hijau, oranye, kuning, atau warna lainnya).
- **STRICT BAN: Pil Status Kapsul**: DILARANG menggunakan pil kapsul (`borderRadius: 9999px`) yang berlebihan sebagai label/topbar status.
- **STRICT BAN: Banner Teks Uppercase**: DILARANG menambahkan banner topbar teks UPPERCASE mencolok dengan letter-spacing renggang (seperti "MENUNGGU PENANTANG BATTLE 1V1", "LOBBY PERSIAPAN BATTLE 1V1", "ARENA DUEL 1V1", dll.).
- **Desain Pengganti yang Bersih**: Gunakan tipografi natural (Sentence case), tata letak minimalis tanpa dekorasi dot/pill yang berisik, dan jika membutuhkan penampung status gunakan sudut rounded lembut standar (8px–12px) tanpa efek glowing dot.

