#!/usr/bin/env node
// PreToolUse guard for Edit/Write/MultiEdit.
// Reads the tool-call JSON on stdin. Exit 2 BLOCKS the call and sends stderr
// back to Claude as the reason. Any other path exits 0 (allow).
//
// Guards:
//   1. coming-soon.html  -> never editable (it is live on the production root domain until launch)
//   2. vercel.json       -> not editable while on the `main` branch (never push config straight to main)
const fs = require('fs');
const { execSync } = require('child_process');

let data = {};
try {
  data = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0); // can't parse -> don't block
}

const input = data.tool_input || {};
const filePath = input.file_path || input.notebook_path || '';
if (!filePath) process.exit(0);

const norm = String(filePath).replace(/\\/g, '/').toLowerCase();
const isFile = (name) => norm === name || norm.endsWith('/' + name);

// 1) coming-soon.html is live on avexastays.com until launch.
if (isFile('coming-soon.html')) {
  console.error(
    'BLOCKED: coming-soon.html is live on the production root domain (avexastays.com) and must ' +
    'not be edited until launch — CLAUDE.md critical rule. If you truly intend to change the ' +
    'launch page, do it manually outside Claude Code.'
  );
  process.exit(2);
}

// 2) vercel.json must not be edited directly on main.
if (isFile('vercel.json')) {
  let branch = '';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: data.cwd || process.cwd(),
      encoding: 'utf8',
    }).trim();
  } catch {
    /* no git context -> allow */
  }
  if (branch === 'main') {
    console.error(
      'BLOCKED: refusing to edit vercel.json on the main branch. Create a feature branch and open ' +
      'a PR instead — CLAUDE.md: never push directly to main.'
    );
    process.exit(2);
  }
}

process.exit(0);
