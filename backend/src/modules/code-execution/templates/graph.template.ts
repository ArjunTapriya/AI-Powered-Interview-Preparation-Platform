/**
 * Graph Template
 * Handles questions with graph input as adjacency list (e.g., BFS, DFS, Number of Islands).
 * Input: first line = number of nodes; subsequent lines = edges [u, v]
 */
export function buildGraphDriver(
  language: string,
  userCode: string,
  functionName: string,
  _returnType: string,
  _testInput: string
): string {
  switch (language) {
    case "javascript":
      return `${userCode}

const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
// Input: first line = JSON adjacency list [[1,2],[1,3],[2,4]]
const edges = JSON.parse(lines[0]);
const n = lines[1] ? parseInt(lines[1]) : 0;
const result = ${functionName}(n, edges);
console.log(JSON.stringify(result));`;

    case "python":
      return `${userCode}

import sys, json
lines = sys.stdin.read().strip().split('\\n')
edges = json.loads(lines[0])
n = int(lines[1]) if len(lines) > 1 else 0
result = ${functionName}(n, edges)
print(json.dumps(result))`;

    default:
      return userCode;
  }
}
