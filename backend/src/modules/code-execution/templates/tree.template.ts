/**
 * Tree Template
 * Handles questions with binary tree input (e.g., Maximum Depth, Level Order Traversal).
 * Input format: BFS-level array representation (e.g., [3,9,20,null,null,15,7])
 */
export function buildTreeDriver(
  language: string,
  userCode: string,
  functionName: string,
  _returnType: string,
  _testInput: string
): string {
  switch (language) {
    case "javascript":
      return `${userCode}

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] == null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift();
    if (arr[i] != null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] != null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
const arr = JSON.parse(lines[0]);
const root = buildTree(arr);
const result = ${functionName}(root);
console.log(JSON.stringify(result));`;

    case "python":
      return `${userCode}

import sys, json
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = deque([root])
    i = 1
    while queue and i < len(arr):
        node = queue.popleft()
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

lines = sys.stdin.read().strip().split('\\n')
arr = json.loads(lines[0])
root = build_tree(arr)
result = ${functionName}(root)
print(json.dumps(result))`;

    default:
      return userCode;
  }
}
