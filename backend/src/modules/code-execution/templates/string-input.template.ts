/**
 * String Input Template
 * Handles questions where input is a string (e.g., Longest Substring, Valid Parentheses).
 */
export function buildStringInputDriver(
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
const input = fs.readFileSync(0, 'utf-8').trim();
const result = ${functionName}(input);
console.log(JSON.stringify(result));`;

    case "python":
      return `${userCode}

import sys, json
s = sys.stdin.read().strip()
result = ${functionName}(s)
print(json.dumps(result))`;

    case "cpp":
      return `#include <iostream>
#include <string>
using namespace std;

${userCode}

int main() {
    string s;
    getline(cin, s);
    auto result = ${functionName}(s);
    cout << result << endl;
    return 0;
}`;

    case "java":
      return `import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        System.out.println(new Solution().${functionName}(s));
    }
}`;

    default:
      return userCode;
  }
}
