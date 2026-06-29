/**
 * Matrix Input Template
 * Handles questions where input is a 2D matrix (e.g., Rotate Image, Word Search).
 */
export function buildMatrixInputDriver(
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
// First line is the full matrix JSON
const matrix = JSON.parse(lines[0]);
const extra = lines.slice(1).map(l => JSON.parse(l));
const result = ${functionName}(matrix, ...extra);
console.log(JSON.stringify(result));`;

    case "python":
      return `${userCode}

import sys, json
lines = sys.stdin.read().strip().split('\\n')
matrix = json.loads(lines[0])
extra = [json.loads(l) for l in lines[1:] if l.strip()]
result = ${functionName}(matrix, *extra)
print(json.dumps(result))`;

    case "cpp":
      return `#include <iostream>
#include <vector>
#include <string>
using namespace std;

${userCode}

int main() {
    // Read row count then matrix rows
    int n; cin >> n;
    vector<vector<int>> mat(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> mat[i][j];
    ${functionName}(mat);
    for (auto& row : mat) {
        for (int i = 0; i < row.size(); i++) cout << row[i] << (i<row.size()-1?" ":"");
        cout << "\\n";
    }
    return 0;
}`;

    default:
      return userCode;
  }
}
