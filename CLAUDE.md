# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevVault is a lightweight desktop developer vault / productivity hub — a combination of password manager, command palette, notes, and bookmark manager. It stores secrets, commands, notes, and links locally with encryption.

## Tech Stack

- **Desktop runtime:** Tauri
- **Frontend:** React + Tailwind CSS + shadcn/ui
- **Database:** SQLite (local, encrypted)
- **Encryption:** AES-256 for secrets, protected by a master password

## Architecture

The app follows the standard Tauri architecture:
- **Frontend (React):** UI layer with global search, dark mode, and keyboard-driven workflows
- **Backend (Rust/Tauri):** Handles SQLite access, AES-256 encryption/decryption, clipboard operations, and system-level features (global shortcut `Ctrl+Shift+Space`, auto copy detection)

### Data Model

Four core entities stored in SQLite:
- **Secrets:** name, company, environment, username, password, notes
- **Notes:** title, content (markdown), tags
- **Links:** title, url, category, tags
- **Commands:** title, command, description, tags

All entities have id and created_at fields. Tags are used for filtering across Notes, Links, and Commands.

## Key Features

- **Global search** across all entity types (secrets, notes, links, commands)
- **Global shortcut** (`Ctrl+Shift+Space`) for quick access
- **Master password** unlock with AES-256 encrypted secrets
- **Clipboard history** (last 50 items)
- **Auto copy detection** for secret-like patterns (`ghp_...`, `sk-...`, `AKIA...`)
- **Import/export** as encrypted JSON
