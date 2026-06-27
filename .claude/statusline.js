'use strict';

// Claude Code status line script.
// Receives a JSON object via stdin describing the current session.
// Outputs a single line: ⚡ <model-id> | ctx [████████░░░░░░░░] 52%

const BAR_WIDTH = 16;

function buildBar(usedPct) {
  const clamped = Math.max(0, Math.min(100, usedPct));
  const filled = Math.round((clamped / 100) * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

let raw = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
  raw += chunk;
});

process.stdin.on('end', function () {
  let modelId = process.env.CLAUDE_CODE_MODEL || '';
  let usedPct = null;

  // Parse the JSON payload Claude Code sends via stdin.
  if (raw.trim().length > 0) {
    try {
      const data = JSON.parse(raw);

      // Model name
      if (data.model && typeof data.model.id === 'string' && data.model.id.length > 0) {
        modelId = data.model.id;
      }

      // Context usage — prefer the pre-calculated field.
      if (data.context_window) {
        const pct = data.context_window.used_percentage;
        if (typeof pct === 'number' && !isNaN(pct)) {
          usedPct = pct;
        } else {
          // Fall back to raw token counts if the percentage is absent.
          const used = data.context_window.total_input_tokens;
          const total = data.context_window.context_window_size;
          if (typeof used === 'number' && typeof total === 'number' && total > 0) {
            usedPct = (used / total) * 100;
          }
        }
      }
    } catch (_) {
      // JSON parse failed — continue with env-var fallbacks below.
    }
  }

  // Env-var fallbacks (best-effort; variable names may differ by Claude Code version).
  if (!modelId) {
    modelId = process.env.CLAUDE_CODE_MODEL || 'unknown';
  }

  if (usedPct === null) {
    const tokensUsed = parseInt(process.env.CLAUDE_CODE_CONTEXT_TOKENS_USED || '', 10);
    const tokensTotal = parseInt(process.env.CLAUDE_CODE_CONTEXT_WINDOW_TOKENS || '', 10);
    if (!isNaN(tokensUsed) && !isNaN(tokensTotal) && tokensTotal > 0) {
      usedPct = (tokensUsed / tokensTotal) * 100;
    }
  }

  // Build output line.
  let line = '⚡ ' + modelId;

  if (usedPct !== null) {
    const rounded = Math.round(usedPct);
    line += ' | ctx [' + buildBar(usedPct) + '] ' + rounded + '%';
  }

  process.stdout.write(line + '\n');
});
