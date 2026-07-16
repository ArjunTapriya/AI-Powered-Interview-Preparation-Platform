import { env } from "../../config/env";
import { executionRepository } from "./execution.repository";
import { questionsRepository } from "../questions/questions.repository";
import { RunCodeResponseDto, SubmitCodeResponseDto } from "./execution.dto";
import { roadmapService } from "../roadmap/roadmap.service";
import { NotFoundError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import { buildDriverCode } from "./templates/template.engine";

function encodeBase64(str: string): string {
  return Buffer.from(str).toString("base64");
}

function decodeBase64(str: string | null | undefined): string {
  if (!str) return "";
  return Buffer.from(str, "base64").toString("utf-8");
}

function getLanguageId(language: string): number {
  switch (language.toLowerCase()) {
    case "javascript":
      return 63; // Node.js 12.14.0
    case "python":
      return 71; // Python 3.8.1
    case "cpp":
      return 54; // GCC 9.2.0
    case "java":
      return 62; // OpenJDK 13.0.1
    default:
      return 63;
  }
}

/**
 * Appends driver test suite code dynamically based on the DSA question title and language.
 */
function getDriverCode(questionTitle: string, language: string, userCode: string): string {
  const title = questionTitle.toLowerCase().trim();

  if (title === "two sum") {
    if (language === "javascript") {
      return `${userCode}\n\n` + 
        `const fs = require('fs');\n` +
        `const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).filter(Boolean);\n` +
        `if (input.length >= 3) {\n` +
        `  const n = parseInt(input[0], 10);\n` +
        `  const nums = input.slice(1, n + 1).map(Number);\n` +
        `  const target = parseInt(input[n + 1], 10);\n` +
        `  const res = twoSum(nums, target);\n` +
        `  console.log(res.join(' '));\n` +
        `}`;
    }
    if (language === "python") {
      return `${userCode}\n\n` +
        `import sys\n` +
        `lines = sys.stdin.read().split()\n` +
        `if len(lines) >= 3:\n` +
        `    n = int(lines[0])\n` +
        `    nums = [int(x) for x in lines[1:n+1]]\n` +
        `    target = int(lines[n+1])\n` +
        `    res = twoSum(nums, target)\n` +
        `    print(" ".join(map(str, res)))`;
    }
    if (language === "cpp") {
      return `#include <iostream>\n` +
        `#include <vector>\n` +
        `using namespace std;\n\n` +
        `${userCode}\n\n` +
        `int main() {\n` +
        `    int n;\n` +
        `    if (cin >> n) {\n` +
        `        vector<int> nums(n);\n` +
        `        for (int i = 0; i < n; ++i) cin >> nums[i];\n` +
        `        int target;\n` +
        `        cin >> target;\n` +
        `        vector<int> res = twoSum(nums, target);\n` +
        `        for (int i = 0; i < res.size(); ++i) {\n` +
        `            cout << res[i] << (i == res.size() - 1 ? "" : " ");\n` +
        `        }\n` +
        `        cout << endl;\n` +
        `    }\n` +
        `    return 0;\n` +
        `}`;
    }
    if (language === "java") {
      return `import java.util.*;\n\n` +
        `${userCode}\n\n` +
        `public class Main {\n` +
        `    public static void main(String[] args) {\n` +
        `        Scanner sc = new Scanner(System.in);\n` +
        `        if (sc.hasNextInt()) {\n` +
        `            int n = sc.nextInt();\n` +
        `            int[] nums = new int[n];\n` +
        `            for (int i = 0; i < n; i++) {\n` +
        `                nums[i] = sc.nextInt();\n` +
        `            }\n` +
        `            int target = sc.nextInt();\n` +
        `            int[] res = new Solution().twoSum(nums, target);\n` +
        `            for (int i = 0; i < res.length; i++) {\n` +
        `                System.out.print(res[i] + (i == res.length - 1 ? \"\" : \" \"));\n` +
        `            }\n` +
        `            System.out.println();\n` +
        `        }\n` +
        `    }\n` +
        `}`;
    }
  }

  if (title === "reverse a linked list") {
    if (language === "javascript") {
      return `function ListNode(val, next) {\n` +
        `  this.val = (val===undefined ? 0 : val);\n` +
        `  this.next = (next===undefined ? null : next);\n` +
        `}\n\n` +
        `${userCode}\n\n` +
        `const fs = require('fs');\n` +
        `const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).filter(Boolean);\n` +
        `if (input.length > 0) {\n` +
        `  const n = parseInt(input[0], 10);\n` +
        `  if (n === 0) {\n` +
        `    console.log("");\n` +
        `    process.exit(0);\n` +
        `  }\n` +
        `  const vals = input.slice(1).map(Number);\n` +
        `  let dummy = new ListNode(0);\n` +
        `  let curr = dummy;\n` +
        `  for (let v of vals) {\n` +
        `    curr.next = new ListNode(v);\n` +
        `    curr = curr.next;\n` +
        `  }\n` +
        `  let reversed = reverseList(dummy.next);\n` +
        `  let out = [];\n` +
        `  while (reversed !== null) {\n` +
        `    out.push(reversed.val);\n` +
        `    reversed = reversed.next;\n` +
        `  }\n` +
        `  console.log(out.join(' '));\n` +
        `}`;
    }
    if (language === "python") {
      return `class ListNode:\n` +
        `    def __init__(self, val=0, next=None):\n` +
        `        self.val = val\n` +
        `        self.next = next\n\n` +
        `${userCode}\n\n` +
        `import sys\n` +
        `lines = sys.stdin.read().split()\n` +
        `if lines:\n` +
        `    n = int(lines[0])\n` +
        `    if n == 0:\n` +
        `        print("")\n` +
        `        sys.exit(0)\n` +
        `    vals = [int(x) for x in lines[1:]]\n` +
        `    dummy = ListNode(0)\n` +
        `    curr = dummy\n` +
        `    for v in vals:\n` +
        `        curr.next = ListNode(v)\n` +
        `        curr = curr.next\n` +
        `    reversed_list = reverseList(dummy.next)\n` +
        `    out = []\n` +
        `    while reversed_list:\n` +
        `        out.append(str(reversed_list.val))\n` +
        `        reversed_list = reversed_list.next\n` +
        `    print(" ".join(out))`;
    }
    if (language === "cpp") {
      return `#include <iostream>\n` +
        `#include <vector>\n` +
        `using namespace std;\n` +
        `struct ListNode {\n` +
        `    int val;\n` +
        `    ListNode *next;\n` +
        `    ListNode(int x) : val(x), next(NULL) {}\n` +
        `};\n\n` +
        `${userCode}\n\n` +
        `int main() {\n` +
        `    int n;\n` +
        `    if (cin >> n) {\n` +
        `        if (n == 0) {\n` +
        `            cout << "" << endl;\n` +
        `            return 0;\n` +
        `        }\n` +
        `        ListNode* dummy = new ListNode(0);\n` +
        `        ListNode* curr = dummy;\n` +
        `        for (int i = 0; i < n; ++i) {\n` +
        `            int val;\n` +
        `            cin >> val;\n` +
        `            curr->next = new ListNode(val);\n` +
        `            curr = curr->next;\n` +
        `        }\n` +
        `        ListNode* reversed = reverseList(dummy->next);\n` +
        `        while (reversed != NULL) {\n` +
        `            cout << reversed->val << (reversed->next == NULL ? "" : " ");\n` +
        `            reversed = reversed->next;\n` +
        `        }\n` +
        `        cout << endl;\n` +
        `    }\n` +
        `    return 0;\n` +
        `}`;
    }
    if (language === "java") {
      return `import java.util.*;\n` +
        `class ListNode {\n` +
        `    public int val;\n` +
        `    public ListNode next;\n` +
        `    public ListNode() {}\n` +
        `    public ListNode(int val) { this.val = val; }\n` +
        `    public ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n` +
        `}\n\n` +
        `${userCode}\n\n` +
        `public class Main {\n` +
        `    public static void main(String[] args) {\n` +
        `        Scanner sc = new Scanner(System.in);\n` +
        `        if (sc.hasNextInt()) {\n` +
        `            int n = sc.nextInt();\n` +
        `            if (n == 0) {\n` +
        `                System.out.println();\n` +
        `                return;\n` +
        `            }\n` +
        `            ListNode dummy = new ListNode(0);\n` +
        `            ListNode curr = dummy;\n` +
        `            for (int i = 0; i < n; i++) {\n` +
        `                curr.next = new ListNode(sc.nextInt());\n` +
        `                curr = curr.next;\n` +
        `            }\n` +
        `            ListNode reversed = new Solution().reverseList(dummy.next);\n` +
        `            while (reversed != null) {\n` +
        `                System.out.print(reversed.val + (reversed.next == null ? "" : " "));\n` +
        `                reversed = reversed.next;\n` +
        `            }\n` +
        `            System.out.println();\n` +
        `        }\n` +
        `    }\n` +
        `}`;
    }
  }

  if (title === "merge k sorted lists") {
    if (language === "javascript") {
      return `function ListNode(val, next) {\n` +
        `  this.val = (val===undefined ? 0 : val);\n` +
        `  this.next = (next===undefined ? null : next);\n` +
        `}\n\n` +
        `${userCode}\n\n` +
        `const fs = require('fs');\n` +
        `const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).filter(Boolean);\n` +
        `if (input.length > 0) {\n` +
        `  const k = parseInt(input[0], 10);\n` +
        `  let idx = 1;\n` +
        `  const lists = [];\n` +
        `  for (let i = 0; i < k; i++) {\n` +
        `    if (idx >= input.length) break;\n` +
        `    const len = parseInt(input[idx++], 10);\n` +
        `    if (len === 0) {\n` +
        `      lists.push(null);\n` +
        `      continue;\n` +
        `    }\n` +
        `    let dummy = new ListNode(0);\n` +
        `    let curr = dummy;\n` +
        `    for (let j = 0; j < len; j++) {\n` +
        `      curr.next = new ListNode(parseInt(input[idx++], 10));\n` +
        `      curr = curr.next;\n` +
        `    }\n` +
        `    lists.push(dummy.next);\n` +
        `  }\n` +
        `  let merged = mergeKLists(lists);\n` +
        `  let out = [];\n` +
        `  while (merged !== null) {\n` +
        `    out.push(merged.val);\n` +
        `    merged = merged.next;\n` +
        `  }\n` +
        `  console.log(out.join(' '));\n` +
        `}`;
    }
    if (language === "python") {
      return `class ListNode:\n` +
        `    def __init__(self, val=0, next=None):\n` +
        `        self.val = val\n` +
        `        self.next = next\n\n` +
        `${userCode}\n\n` +
        `import sys\n` +
        `lines = sys.stdin.read().split()\n` +
        `if lines:\n` +
        `    k = int(lines[0])\n` +
        `    idx = 1\n` +
        `    lists = []\n` +
        `    for i in range(k):\n` +
        `        if idx >= len(lines): break\n` +
        `        length = int(lines[idx])\n` +
        `        idx += 1\n` +
        `        if length == 0:\n` +
        `            lists.append(None)\n` +
        `            continue\n` +
        `        dummy = ListNode(0)\n` +
        `        curr = dummy\n` +
        `        for j in range(length):\n` +
        `            curr.next = ListNode(int(lines[idx]))\n` +
        `            idx += 1\n` +
        `            curr = curr.next\n` +
        `        lists.append(dummy.next)\n` +
        `    merged = mergeKLists(lists)\n` +
        `    out = []\n` +
        `    while merged:\n` +
        `        out.append(str(merged.val))\n` +
        `        merged = merged.next\n` +
        `    print(" ".join(out))`;
    }
    if (language === "cpp") {
      return `#include <iostream>\n` +
        `#include <vector>\n` +
        `using namespace std;\n` +
        `struct ListNode {\n` +
        `    int val;\n` +
        `    ListNode *next;\n` +
        `    ListNode(int x) : val(x), next(NULL) {}\n` +
        `};\n\n` +
        `${userCode}\n\n` +
        `int main() {\n` +
        `    int k;\n` +
        `    if (cin >> k) {\n` +
        `        vector<ListNode*> lists(k, NULL);\n` +
        `        for (int i = 0; i < k; ++i) {\n` +
        `            int len;\n` +
        `            if (cin >> len) {\n` +
        `                if (len == 0) continue;\n` +
        `                ListNode* dummy = new ListNode(0);\n` +
        `                ListNode* curr = dummy;\n` +
        `                for (int j = 0; j < len; ++j) {\n` +
        `                    int val;\n` +
        `                    cin >> val;\n` +
        `                    curr->next = new ListNode(val);\n` +
        `                    curr = curr->next;\n` +
        `                }\n` +
        `                lists[i] = dummy->next;\n` +
        `            }\n` +
        `        }\n` +
        `        ListNode* merged = mergeKLists(lists);\n` +
        `        while (merged != NULL) {\n` +
        `            cout << merged->val << (merged->next == NULL ? "" : " ");\n` +
        `            merged = merged->next;\n` +
        `        }\n` +
        `        cout << endl;\n` +
        `    }\n` +
        `    return 0;\n` +
        `}`;
    }
    if (language === "java") {
      return `import java.util.*;\n` +
        `class ListNode {\n` +
        `    public int val;\n` +
        `    public ListNode next;\n` +
        `    public ListNode() {}\n` +
        `    public ListNode(int val) { this.val = val; }\n` +
        `    public ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n` +
        `}\n\n` +
        `${userCode}\n\n` +
        `public class Main {\n` +
        `    public static void main(String[] args) {\n` +
        `        Scanner sc = new Scanner(System.in);\n` +
        `        if (sc.hasNextInt()) {\n` +
        `            int k = sc.nextInt();\n` +
        `            List<ListNode> list = new ArrayList<>();\n` +
        `            for (int i = 0; i < k; i++) {\n` +
        `                if (!sc.hasNextInt()) break;\n` +
        `                int len = sc.nextInt();\n` +
        `                if (len == 0) {\n` +
        `                    list.add(null);\n` +
        `                    continue;\n` +
        `                }\n` +
        `                ListNode dummy = new ListNode(0);\n` +
        `                ListNode curr = dummy;\n` +
        `                for (int j = 0; j < len; j++) {\n` +
        `                    curr.next = new ListNode(sc.nextInt());\n` +
        `                    curr = curr.next;\n` +
        `                }\n` +
        `                list.add(dummy.next);\n` +
        `            }\n` +
        `            ListNode[] lists = list.toArray(new ListNode[0]);\n` +
        `            ListNode merged = new Solution().mergeKLists(lists);\n` +
        `            while (merged != null) {\n` +
        `                System.out.print(merged.val + (merged.next == null ? \"\" : \" \"));\n` +
        `                merged = merged.next;\n` +
        `            }\n` +
        `            System.out.println();\n` +
        `        }\n` +
        `    }\n` +
        `}`;
    }
  }

  if (title === "lru cache") {
    if (language === "javascript") {
      return `${userCode}\n\n` +
        `const fs = require('fs');\n` +
        `const input = fs.readFileSync(0, 'utf-8').trim().split(/\\n+/);\n` +
        `if (input.length >= 2) {\n` +
        `  const capacity = parseInt(input[0], 10);\n` +
        `  const numOps = parseInt(input[1], 10);\n` +
        `  const cache = new LRUCache(capacity);\n` +
        `  const out = [];\n` +
        `  for (let i = 0; i < numOps; i++) {\n` +
        `    if (!input[2 + i]) continue;\n` +
        `    const line = input[2 + i].trim().split(/\\s+/);\n` +
        `    if (line[0] === 'put') {\n` +
        `      cache.put(parseInt(line[1], 10), parseInt(line[2], 10));\n` +
        `    } else if (line[0] === 'get') {\n` +
        `      out.push(cache.get(parseInt(line[1], 10)));\n` +
        `    }\n` +
        `  }\n` +
        `  console.log(out.join(' '));\n` +
        `}`;
    }
    if (language === "python") {
      return `${userCode}\n\n` +
        `import sys\n` +
        `lines = sys.stdin.read().split('\\n')\n` +
        `if len(lines) >= 2:\n` +
        `    capacity = int(lines[0].strip())\n` +
        `    numOps = int(lines[1].strip())\n` +
        `    cache = LRUCache(capacity)\n` +
        `    out = []\n` +
        `    for i in range(numOps):\n` +
        `        if not lines[2+i].strip(): continue\n` +
        `        parts = lines[2 + i].strip().split()\n` +
        `        if parts[0] == 'put':\n` +
        `            cache.put(int(parts[1]), int(parts[2]))\n` +
        `        elif parts[0] == 'get':\n` +
        `            out.append(str(cache.get(int(parts[1]))))\n` +
        `    print(" ".join(out))`;
    }
    if (language === "cpp") {
      return `#include <iostream>\n` +
        `#include <string>\n` +
        `#include <vector>\n` +
        `using namespace std;\n\n` +
        `${userCode}\n\n` +
        `int main() {\n` +
        `    int capacity;\n` +
        `    if (cin >> capacity) {\n` +
        `        int numOps;\n` +
        `        cin >> numOps;\n` +
        `        LRUCache cache(capacity);\n` +
        `        vector<int> out;\n` +
        `        for (int i = 0; i < numOps; ++i) {\n` +
        `            string op;\n` +
        `            cin >> op;\n` +
        `            if (op == "put") {\n` +
        `                int k, v;\n` +
        `                cin >> k >> v;\n` +
        `                cache.put(k, v);\n` +
        `            } else if (op == "get") {\n` +
        `                int k;\n` +
        `                cin >> k;\n` +
        `                out.push_back(cache.get(k));\n` +
        `            }\n` +
        `        }\n` +
        `        for (int i = 0; i < out.size(); ++i) {\n` +
        `            cout << out[i] << (i == out.size() - 1 ? "" : " ");\n` +
        `        }\n` +
        `        cout << endl;\n` +
        `    }\n` +
        `    return 0;\n` +
        `}`;
    }
    if (language === "java") {
      return `import java.util.*;\n\n` +
        `${userCode}\n\n` +
        `public class Main {\n` +
        `    public static void main(String[] args) {\n` +
        `        Scanner sc = new Scanner(System.in);\n` +
        `        if (sc.hasNextInt()) {\n` +
        `            int capacity = sc.nextInt();\n` +
        `            int numOps = sc.nextInt();\n` +
        `            LRUCache cache = new LRUCache(capacity);\n` +
        `            List<Integer> out = new ArrayList<>();\n` +
        `            for (int i = 0; i < numOps; i++) {\n` +
        `                String op = sc.next();\n` +
        `                if (op.equals("put")) {\n` +
        `                    cache.put(sc.nextInt(), sc.nextInt());\n` +
        `                } else if (op.equals("get")) {\n` +
        `                    out.add(cache.get(sc.nextInt()));\n` +
        `                }\n` +
        `            }\n` +
        `            for (int i = 0; i < out.size(); i++) {\n` +
        `                System.out.print(out.get(i) + (i == out.size() - 1 ? \"\" : \" \"));\n` +
        `            }\n` +
        `            System.out.println();\n` +
        `        }\n` +
        `    }\n` +
        `}`;
    }
  }

  if (title === "longest substring without repeating characters") {
    if (language === "javascript") {
      return `${userCode}\n\n` +
        `const fs = require('fs');\n` +
        `const input = fs.readFileSync(0, 'utf-8').trim();\n` +
        `console.log(lengthOfLongestSubstring(input));\n`;
    }
    if (language === "python") {
      return `${userCode}\n\n` +
        `import sys\n` +
        `input_str = sys.stdin.read().strip()\n` +
        `print(lengthOfLongestSubstring(input_str))\n`;
    }
    if (language === "cpp") {
      return `#include <iostream>\n` +
        `#include <string>\n` +
        `using namespace std;\n\n` +
        `${userCode}\n\n` +
        `int main() {\n` +
        `    string s;\n` +
        `    if (cin >> s) {\n` +
        `        cout << lengthOfLongestSubstring(s) << endl;\n` +
        `    } else {\n` +
        `        cout << 0 << endl;\n` +
        `    }\n` +
        `    return 0;\n` +
        `}`;
    }
    if (language === "java") {
      return `import java.util.*;\n\n` +
        `${userCode}\n\n` +
        `public class Main {\n` +
        `    public static void main(String[] args) {\n` +
        `        Scanner sc = new Scanner(System.in);\n` +
        `        String s = sc.hasNext() ? sc.next() : \"\";\n` +
        `        System.out.println(new Solution().lengthOfLongestSubstring(s));\n` +
        `    }\n` +
        `}`;
    }
  }

  // ─── Available Captures for Rook (Chess board grid) ──────────────────────
  if (title.includes("available captures for rook") || title.includes("rook")) {
    if (language === "javascript") {
      return `${userCode}\n\n` +
        `const fs = require('fs');\n` +
        `const raw = fs.readFileSync(0, 'utf-8').trim();\n` +
        `// Input: 8 lines of 8 chars each (e.g. "........\\n........\\n...")\n` +
        `const lines = raw.split(/\\n/).map(l => l.trim()).filter(l => l.length > 0);\n` +
        `const board = lines.slice(0, 8).map(row => row.split(''));\n` +
        `console.log(solveQuestion(board));\n`;
    }
    if (language === "python") {
      return `${userCode}\n\n` +
        `import sys\n` +
        `lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n` +
        `board = [list(row) for row in lines[:8]]\n` +
        `print(solveQuestion(board))\n`;
    }
    if (language === "cpp") {
      return `#include <iostream>\n` +
        `#include <vector>\n` +
        `#include <string>\n` +
        `using namespace std;\n\n` +
        `${userCode}\n\n` +
        `int main() {\n` +
        `    vector<vector<char>> board(8, vector<char>(8, '.'));\n` +
        `    for (int i = 0; i < 8; i++) {\n` +
        `        string row;\n` +
        `        if (getline(cin, row)) {\n` +
        `            for (int j = 0; j < 8 && j < (int)row.size(); j++) board[i][j] = row[j];\n` +
        `        }\n` +
        `    }\n` +
        `    cout << solveQuestion(board) << endl;\n` +
        `    return 0;\n` +
        `}`;
    }
    if (language === "java") {
      return `import java.util.*;\n\n` +
        `${userCode}\n\n` +
        `public class Main {\n` +
        `    public static void main(String[] args) {\n` +
        `        Scanner sc = new Scanner(System.in);\n` +
        `        char[][] board = new char[8][8];\n` +
        `        for (char[] row : board) Arrays.fill(row, '.');\n` +
        `        for (int i = 0; i < 8 && sc.hasNextLine(); i++) {\n` +
        `            String row = sc.nextLine().trim();\n` +
        `            for (int j = 0; j < row.length() && j < 8; j++) board[i][j] = row.charAt(j);\n` +
        `        }\n` +
        `        System.out.println(new Solution().solveQuestion(board));\n` +
        `    }\n` +
        `}`;
    }
  }

  // ─── Generic Fallback Driver ──────────────────────────────────────────────
  // Reads JSON array from stdin, spreads as arguments to solveQuestion(),
  // and prints the JSON-serialised result. Works for most array/number problems
  // where the user names their function solveQuestion(args...).
  if (language === "javascript") {
    return `${userCode}\n\n` +
      `const fs = require('fs');\n` +
      `const raw = fs.readFileSync(0, 'utf-8').trim();\n` +
      `if (raw) {\n` +
      `  try {\n` +
      `    const parsed = JSON.parse(raw);\n` +
      `    const args = Array.isArray(parsed) ? parsed : [parsed];\n` +
      `    const result = solveQuestion(...args);\n` +
      `    console.log(JSON.stringify(result));\n` +
      `  } catch(e) {\n` +
      `    // Plain text stdin fallback\n` +
      `    const result = solveQuestion(raw);\n` +
      `    console.log(JSON.stringify(result));\n` +
      `  }\n` +
      `}\n`;
  }
  if (language === "python") {
    return `${userCode}\n\n` +
      `import sys, json\n` +
      `raw = sys.stdin.read().strip()\n` +
      `if raw:\n` +
      `    try:\n` +
      `        parsed = json.loads(raw)\n` +
      `        args = parsed if isinstance(parsed, list) else [parsed]\n` +
      `        result = solveQuestion(*args)\n` +
      `        print(json.dumps(result))\n` +
      `    except Exception:\n` +
      `        result = solveQuestion(raw)\n` +
      `        print(json.dumps(result))\n`;
  }
  if (language === "cpp") {
    return `#include <iostream>\n` +
      `#include <string>\n` +
      `using namespace std;\n\n` +
      `${userCode}\n\n` +
      `int main() {\n` +
      `    string line;\n` +
      `    getline(cin, line);\n` +
      `    // Call with raw string — user-specific parsing inside solveQuestion\n` +
      `    cout << solveQuestion(line) << endl;\n` +
      `    return 0;\n` +
      `}`;
  }
  if (language === "java") {
    return `import java.util.*;\n\n` +
      `${userCode}\n\n` +
      `public class Main {\n` +
      `    public static void main(String[] args) {\n` +
      `        Scanner sc = new Scanner(System.in);\n` +
      `        String input = sc.hasNextLine() ? sc.nextLine().trim() : "";\n` +
      `        System.out.println(new Solution().solveQuestion(input));\n` +
      `    }\n` +
      `}`;
  }

  return userCode;
}


export class ExecutionService {
  // ──────────────────────────────────────────────────────────────────────────
  // Piston API (FREE — no key required, no signup, unlimited runs)
  // https://github.com/engineer-man/piston
  // ──────────────────────────────────────────────────────────────────────────
  private PISTON_URL = "https://emkc.org/api/v2/piston";

  private getPistonLanguage(language: string): { language: string; version: string; filename: string } {
    switch (language.toLowerCase()) {
      case "javascript": return { language: "javascript", version: "18.15.0", filename: "solution.js" };
      case "python":     return { language: "python",     version: "3.10.0",  filename: "solution.py" };
      case "cpp":        return { language: "c++",        version: "10.2.0",  filename: "solution.cpp" };
      case "java":       return { language: "java",       version: "15.0.2",  filename: "Solution.java" };
      default:           return { language: "javascript", version: "18.15.0", filename: "solution.js" };
    }
  }

  private async executeOnPiston(sourceCode: string, language: string, stdin: string): Promise<any> {
    const lang = this.getPistonLanguage(language);
    const payload = {
      language: lang.language,
      version: lang.version,
      files: [{ name: lang.filename, content: sourceCode }],
      stdin,
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000,
    };

    try {
      const response = await fetch(`${this.PISTON_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Piston API responded with ${response.status}: ${errText}`);
      }

      const result = (await response.json()) as any;
      const run = result.run || {};
      const compile = result.compile || {};

      // Normalize to Judge0-compatible internal shape so downstream code is identical
      const exitCode = run.code ?? 0;
      let statusId = 3; // 3 = Accepted in Judge0 convention
      if (compile.stderr)           statusId = 6; // Compile Error
      else if (exitCode !== 0)      statusId = 11; // Runtime Error
      else if (run.signal === "SIGKILL") statusId = 5; // TLE

      return {
        stdout: Buffer.from(run.stdout || "").toString("base64"),
        stderr: Buffer.from(run.stderr || "").toString("base64"),
        compile_output: Buffer.from(compile.stderr || compile.stdout || "").toString("base64"),
        status: { id: statusId, description: exitCode === 0 ? "Accepted" : "Runtime Error" },
        time: null,   // Piston doesn't expose timing
        memory: null, // Piston doesn't expose memory
      };
    } catch (err: any) {
      logger.error("Piston connection failed", { message: err.message });
      throw new Error(`Piston API failed: ${err.message}`);
    }
  }

  /**
   * Unified execute:
   *  - Self-hosted Judge0 (localhost)  → uses Judge0, no key needed
   *  - RapidAPI Judge0                 → uses Judge0, key required
   *  - No Judge0 URL / fallback        → tries Piston (may be rate-limited)
   */
  private async execute(sourceCode: string, language: string, stdin: string): Promise<any> {
    const isLocalJudge0 = env.JUDGE0_API_URL.includes("localhost") || env.JUDGE0_API_URL.includes("127.0.0.1");
    const hasCloudKey   = !!env.JUDGE0_API_KEY;

    if (isLocalJudge0 || hasCloudKey) {
      return this.executeOnJudge0(sourceCode, language, stdin);
    }

    // Fallback to Piston if no Judge0 configured
    logger.info("No Judge0 configured — trying Piston (free executor)");
    return this.executeOnPiston(sourceCode, language, stdin);
  }

  /**
   * Helper to execute a submission on Judge0 with retry polling if needed.
   */
  private async executeOnJudge0(sourceCode: string, language: string, stdin: string): Promise<any> {
    const url = `${env.JUDGE0_API_URL}/submissions?wait=true&base64_encoded=true`;
    const languageId = getLanguageId(language);

    const payload = {
      source_code: encodeBase64(sourceCode),
      language_id: languageId,
      stdin: encodeBase64(stdin),
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (env.JUDGE0_API_KEY) {
      if (env.JUDGE0_API_URL.includes("rapidapi.com")) {
        headers["x-rapidapi-key"] = env.JUDGE0_API_KEY;
        // Derive host from configured URL (e.g. judge0.p.rapidapi.com)
        headers["x-rapidapi-host"] = new URL(env.JUDGE0_API_URL).hostname;
      } else {
        headers["X-Auth-Token"] = env.JUDGE0_API_KEY;
      }
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Judge0 API responded with status ${response.status}`);
      }

      const result = (await response.json()) as any;
      
      // If result contains token but not final execution details, start polling
      if (result.token && (!result.status || result.status.id <= 2)) {
        return await this.pollSubmission(result.token);
      }

      return result;
    } catch (err: any) {
      logger.error("Judge0 connection failed", { message: err.message });
      throw new Error(`Judge0 API offline or connection failed: ${err.message}. Ensure your Judge0 service is running and accessible.`);
    }
  }

  /**
   * Poll submission status by token.
   */
  private async pollSubmission(token: string): Promise<any> {
    const url = `${env.JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`;
    const headers: Record<string, string> = {};

    if (env.JUDGE0_API_KEY) {
      if (env.JUDGE0_API_URL.includes("rapidapi.com")) {
        headers["x-rapidapi-key"] = env.JUDGE0_API_KEY;
        headers["x-rapidapi-host"] = new URL(env.JUDGE0_API_URL).hostname;
      } else {
        headers["X-Auth-Token"] = env.JUDGE0_API_KEY;
      }
    }

    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`Judge0 status poll failed: ${response.status}`);
      }

      const result = (await response.json()) as any;
      if (result.status && result.status.id > 2) {
        return result;
      }
    }

    throw new Error("Judge0 execution polling timed out");
  }

  /**
   * Run code with custom input stdin (no DB logs, no tests verification)
   */
  async runCode(language: string, sourceCode: string, stdin: string = ""): Promise<RunCodeResponseDto> {
    const result = await this.execute(sourceCode, language, stdin);

    const stdout = decodeBase64(result.stdout);
    const stderr = decodeBase64(result.stderr);
    const compileOutput = decodeBase64(result.compile_output);

    return {
      stdout: stdout || null,
      stderr: stderr || null,
      compileOutput: compileOutput || null,
      status: result.status?.description || "Unknown Status",
      runtime: result.time ? parseFloat(result.time) * 1000 : null, // Convert sec to ms
      memory: result.memory ? parseFloat(result.memory) : null,
    };
  }

  /**
   * Submit code against hidden test cases.
   */
  async submitCode(
    userId: string,
    questionId: string,
    language: string,
    sourceCode: string
  ): Promise<SubmitCodeResponseDto> {
    const question = await questionsRepository.findById(questionId);
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    // Bypass compiler run for System Design or Behavioral questions
    if (question.topic === "System Design" || question.topic === "Behavioral") {
      await executionRepository.createSubmission({
        userId,
        questionId,
        language,
        sourceCode,
        status: "ACCEPTED",
        passedTests: 1,
        totalTests: 1,
        runtime: 0,
        memory: 0,
        stdout: "Evaluated draft specification details.",
      });

      return {
        status: "ACCEPTED",
        passedTests: 1,
        totalTests: 1,
        runtime: 0,
        memory: 0,
        stdout: "Design and Behavioral specs submitted successfully.",
      };
    }

    // Parse question test cases
    const testCases: { input: string; output: string }[] = Array.isArray(question.testCases)
      ? question.testCases.map((tc) => ({ input: tc.input, output: tc.expectedOutput }))
      : [];

    if (testCases.length === 0) {
      // Fallback default test case
      testCases.push({ input: "1", output: "1" });
    }

    // Use template engine if question has executionTemplate set;
    // otherwise fall back to legacy title-based driver (backward compatible)
    const wrappedCode = question.executionTemplate
      ? buildDriverCode(
          {
            executionTemplate: question.executionTemplate,
            functionName: (question as any).functionName || null,
            returnType: (question as any).returnType || null,
          },
          language,
          sourceCode,
          testCases[0]?.input || ""
        )
      : getDriverCode(question.title, language, sourceCode);

    const executionResults: {
      testCaseNumber: number;
      passed: boolean;
      expectedOutput: string;
      actualOutput: string;
      executionTime: number | null;
    }[] = [];

    let totalRuntime = 0;
    let maxMemory = 0;
    let passedCount = 0;
    let overallStatus = "ACCEPTED";
    let firstStdout: string | null = null;
    let firstStderr: string | null = null;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      
      const res = await this.execute(wrappedCode, language, tc.input);

      const tcStdout = decodeBase64(res.stdout).trim();
      const tcStderr = decodeBase64(res.stderr).trim();
      const tcCompileOutput = decodeBase64(res.compile_output).trim();

      const tcRuntime = res.time ? parseFloat(res.time) * 1000 : null; // in ms
      const tcMemory = res.memory ? parseFloat(res.memory) : null; // in KB

      if (i === 0) {
        firstStdout = tcStdout || null;
        firstStderr = tcStderr || tcCompileOutput || null;
      }

      if (tcRuntime) totalRuntime += tcRuntime;
      if (tcMemory && tcMemory > maxMemory) maxMemory = tcMemory;

      // Judge0 status checks: ID 3 is Accepted (Successful run)
      const judgeStatus = res.status?.id || 3;
      let passed = false;

      if (judgeStatus === 3) {
        // Compare stdout ignoring trailing whitespaces/newlines
        const expected = tc.output.trim();
        passed = tcStdout === expected;
      }

      if (passed) {
        passedCount++;
      } else {
        if (overallStatus === "ACCEPTED") {
          if (judgeStatus === 5) overallStatus = "TIME_LIMIT_EXCEEDED";
          else if (judgeStatus === 6) overallStatus = "COMPILE_ERROR";
          else if (judgeStatus >= 7) overallStatus = "RUNTIME_ERROR";
          else overallStatus = "WRONG_ANSWER";
        }
      }

      executionResults.push({
        testCaseNumber: i + 1,
        passed,
        expectedOutput: tc.output,
        actualOutput: tcStdout || tcCompileOutput || tcStderr,
        executionTime: tcRuntime,
      });
    }

    // Save final submission statistics to Postgres
    await executionRepository.createSubmission({
      userId,
      questionId,
      language,
      sourceCode,
      status: overallStatus,
      passedTests: passedCount,
      totalTests: testCases.length,
      runtime: totalRuntime / testCases.length, // Average runtime
      memory: maxMemory,
      stdout: firstStdout,
      stderr: firstStderr,
      executionResults,
    });

    if (overallStatus === "ACCEPTED") {
      try {
        let mappedNodeId = "";
        const topic = (question.topic || "").toLowerCase();
        const difficulty = (question.difficulty || "EASY").toUpperCase();

        // Rough heuristic mapping for Question Bank to Roadmap Nodes
        if (topic.includes("recursion") || topic.includes("backtracking")) {
          mappedNodeId = "dsa-basics";
        } else if (topic.includes("array") || topic.includes("string") || topic.includes("two pointer") || topic.includes("sliding window")) {
          mappedNodeId = "dsa-intermediate";
        } else if (topic.includes("heap") || topic.includes("tree") || topic.includes("graph")) {
          mappedNodeId = "dsa-advanced";
        } else if (topic.includes("system design") || topic.includes("networking")) {
          if (difficulty === "EASY") mappedNodeId = "sys-design-basics";
          else if (difficulty === "MEDIUM") mappedNodeId = "sys-design-intermediate";
          else mappedNodeId = "sys-design-advanced";
        } else if (topic.includes("behavioral") || topic.includes("communication")) {
          mappedNodeId = "star-behavioral";
        }

        if (mappedNodeId) {
          await roadmapService.markProgress(userId, mappedNodeId, true);
        }
      } catch (err) {
        logger.error("Failed to update roadmap progress on submission", { error: err });
      }
    }

    return {
      status: overallStatus,
      passedTests: passedCount,
      totalTests: testCases.length,
      runtime: totalRuntime / testCases.length,
      memory: maxMemory,
      stdout: firstStdout,
      stderr: firstStderr,
      executionResults,
    };
  }

  /**
   * Get paginated submission history for a user
   */
  async getSubmissionHistory(userId: string, filters: { questionId?: string; page?: number; limit?: number }) {
    const { submissions, count } = await executionRepository.findSubmissions(userId, filters);
    
    return {
      submissions: submissions.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        questionId: sub.questionId,
        questionTitle: sub.question?.title || "Unknown Question",
        language: sub.language,
        sourceCode: sub.sourceCode,
        status: sub.status,
        passedTests: sub.passedTests,
        totalTests: sub.totalTests,
        runtime: sub.runtime,
        memory: sub.memory,
        stdout: sub.stdout,
        stderr: sub.stderr,
        createdAt: sub.createdAt.toISOString(),
      })),
      pagination: {
        total: count,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(count / (filters.limit || 10)),
      },
    };
  }

  /**
   * Get single submission details
   */
  async getSubmissionById(id: string, userId: string) {
    const sub = await executionRepository.findSubmissionById(id, userId);
    if (!sub) {
      throw new NotFoundError("Submission not found");
    }

    return {
      id: sub.id,
      userId: sub.userId,
      questionId: sub.questionId,
      questionTitle: sub.question?.title || "Unknown Question",
      language: sub.language,
      sourceCode: sub.sourceCode,
      status: sub.status,
      passedTests: sub.passedTests,
      totalTests: sub.totalTests,
      runtime: sub.runtime,
      memory: sub.memory,
      stdout: sub.stdout,
      stderr: sub.stderr,
      createdAt: sub.createdAt.toISOString(),
      executionResults: sub.executionResults.map((r) => ({
        testCaseNumber: r.testCaseNumber,
        passed: r.passed,
        expectedOutput: r.expectedOutput,
        actualOutput: r.actualOutput,
        executionTime: r.executionTime,
      })),
    };
  }
}

export const executionService = new ExecutionService();
