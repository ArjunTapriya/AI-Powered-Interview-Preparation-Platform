/**
 * Array Input Template
 * Handles questions where input is an array (e.g., Two Sum, Sliding Window).
 * Function signature: functionName(nums: number[], target: number): number[]
 */

export function buildArrayInputDriver(
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
if (lines.length > 0) {
  const args = lines.map(line => {
    const trimmed = line.trim();
    try { return JSON.parse(trimmed); } catch { return trimmed; }
  });
  const result = ${functionName}(...args);
  console.log(JSON.stringify(result));
}`;

    case "python":
      return `${userCode}

import sys, json
lines = sys.stdin.read().strip().split('\\n')
if lines:
    args = []
    for line in lines:
        try:
            args.append(json.loads(line.strip()))
        except:
            args.append(line.strip())
    result = ${functionName}(*args)
    print(json.dumps(result))`;

    case "cpp":
      return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${userCode}

int main() {
    // Generic: read first line as JSON array
    string line;
    getline(cin, line);
    // Parse basic int array "[1,2,3]"
    vector<int> nums;
    stringstream ss(line.substr(1, line.size()-2));
    string tok;
    while (getline(ss, tok, ',')) nums.push_back(stoi(tok));
    // Call function and print result
    auto res = ${functionName}(nums);
    cout << "[";
    for (int i = 0; i < res.size(); i++) cout << res[i] << (i<res.size()-1?",":"");
    cout << "]" << endl;
    return 0;
}`;

    case "java":
      return `import java.util.*;
import com.google.gson.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        // Parse JSON array manually
        line = line.replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] nums = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.${functionName}(nums)));
    }
}`;

    default:
      return userCode;
  }
}
