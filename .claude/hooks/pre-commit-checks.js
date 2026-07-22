#!/usr/bin/env node
// PreToolUse gate on Bash. Before a `git commit`, run lint + typecheck and BLOCK (exit 2)
// if either fails. Commits that touch no app code (docs/config only) skip the checks so
// they stay instant. Reads the tool-call JSON on stdin.
const fs = require('fs');
const { execSync } = require('child_process');

let data = {};
try {
  data = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const command = (data.tool_input && data.tool_input.command) || '';
const cwd = data.cwd || process.cwd();

// Only act on real git commits (also matches `git -c x commit` and `... && git commit`).
if (!/\bgit\s+(?:-\S+\s+)*commit\b/.test(command)) process.exit(0);

// Skip if nothing that affects lint/typecheck is staged (keeps docs/config commits fast).
let staged = '';
try {
  staged = execSync('git diff --cached --name-only', { cwd, encoding: 'utf8' });
} catch {
  /* ignore */
}
const codeChanged = staged
  .split(/\r?\n/)
  .filter(Boolean)
  .some((f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(f) && !f.startsWith('.claude/'));
if (!codeChanged) process.exit(0);

function run(cmd) {
  try {
    execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
    return null;
  } catch (e) {
    const out = [e.stdout, e.stderr].filter(Boolean).join('\n').trim();
    return out || `${cmd} failed`;
  }
}

const failures = [];
const lint = run('npm run lint');
if (lint) failures.push('npm run lint FAILED:\n' + lint);
const types = run('npm run typecheck');
if (types) failures.push('npm run typecheck FAILED:\n' + types);

if (failures.length) {
  console.error('COMMIT BLOCKED — fix these before committing:\n\n' + failures.join('\n\n'));
  process.exit(2);
}

process.exit(0);
