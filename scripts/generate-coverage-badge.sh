#!/usr/bin/env bash

set -e

SUMMARY_PATH="coverage/coverage-summary.json"

if [ ! -f "$SUMMARY_PATH" ]; then
  echo "Error: coverage-summary.json not found! Run jest tests first." >&2
  exit 1
fi

# Extract coverage percentage
if command -v python3 >/dev/null 2>&1; then
  PCT=$(python3 -c "import json; data=json.load(open('$SUMMARY_PATH')); print(round(data['total']['lines']['pct'], 1))")
elif command -v jq >/dev/null 2>&1; then
  PCT=$(jq -r '.total.lines.pct' "$SUMMARY_PATH" | awk '{printf "%.1f", $1}')
else
  PCT=$(node -e "const d=require('./$SUMMARY_PATH'); console.log(d.total.lines.pct.toFixed(1))")
fi

COLOR="brightgreen"
HEX_COLOR="#4c1"

IS_RED=$(awk -v pct="$PCT" 'BEGIN {print (pct < 60) ? 1 : 0}')
IS_YELLOW=$(awk -v pct="$PCT" 'BEGIN {print (pct >= 60 && pct < 80) ? 1 : 0}')
IS_GREEN=$(awk -v pct="$PCT" 'BEGIN {print (pct >= 80 && pct < 90) ? 1 : 0}')

if [ "$IS_RED" -eq 1 ]; then
  COLOR="red"
  HEX_COLOR="#e05d44"
elif [ "$IS_YELLOW" -eq 1 ]; then
  COLOR="yellow"
  HEX_COLOR="#dfb317"
elif [ "$IS_GREEN" -eq 1 ]; then
  COLOR="green"
  HEX_COLOR="#97ca00"
fi

OUTPUT_DIR="coverage/lcov-report"
mkdir -p "$OUTPUT_DIR"

cat <<EOF > "$OUTPUT_DIR/badge.json"
{
  "schemaVersion": 1,
  "label": "coverage",
  "message": "${PCT}%",
  "color": "${COLOR}"
}
EOF

cat <<EOF > "$OUTPUT_DIR/badge.svg"
<svg xmlns="http://www.w3.org/2000/svg" width="114" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="114" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h63v20H0z"/>
    <path fill="${HEX_COLOR}" d="M63 0h51v20H63z"/>
    <path fill="url(#b)" d="M0 0h114v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="31.5" y="15" fill="#010101" fill-opacity=".3">coverage</text>
    <text x="31.5" y="14">coverage</text>
    <text x="87.5" y="15" fill="#010101" fill-opacity=".3">${PCT}%</text>
    <text x="87.5" y="14">${PCT}%</text>
  </g>
</svg>
EOF

echo "Generated dynamic coverage badge (${PCT}%) at $OUTPUT_DIR/badge.json"
