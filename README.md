# AoE2DE Random Civ Picker

[Visit the tool](https://felixselter.github.io/aoe2-civ-selector/)

This is a vanilla web app for Age of Empires II: Definitive Edition.

It is a random civilisation picker that is more advanced the built-in one. The built-in picker does not support blacklist/whitelist control and often feels uneven in practice (some civs appear very often, others much less). This tool fixes that by letting you control the distribution directly.

## Features

- Blacklist and whitelist civilisation selection
- Manual probability control via per-civ weight/multiplier
- Game history tracking
- Optional mode to prefer civs you have not played in a while

## Run Locally

Requirements:

- Node.js 18+
- pnpm or npm

Install and start:

```bash
pnpm install
pnpm dev
```

Then open the local URL shown by Vite (usually http://localhost:5173).

## Data and Privacy

All data is stored locally in your browser. No information is sent to any server.

## Disclaimer / Credits

Site has been generated to 90% by Claude.

Civ icons are from AoECompanion. and the wiki.
