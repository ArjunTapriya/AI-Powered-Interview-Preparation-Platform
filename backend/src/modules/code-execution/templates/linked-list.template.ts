/**
 * Linked List Template
 * Handles questions with linked list input (e.g., Reverse Linked List, Merge Two Lists).
 */
export function buildLinkedListDriver(
  language: string,
  userCode: string,
  functionName: string,
  _returnType: string,
  _testInput: string
): string {
  switch (language) {
    case "javascript":
      return `${userCode}

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function buildList(arr) {
  if (!arr || arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let cur = head;
  for (let i = 1; i < arr.length; i++) {
    cur.next = new ListNode(arr[i]);
    cur = cur.next;
  }
  return head;
}

function listToArray(head) {
  const res = [];
  while (head) { res.push(head.val); head = head.next; }
  return res;
}

const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
const arr = JSON.parse(lines[0]);
const head = buildList(arr);
const result = ${functionName}(head);
console.log(JSON.stringify(listToArray(result)));`;

    case "python":
      return `${userCode}

import sys, json

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    cur = head
    for v in arr[1:]:
        cur.next = ListNode(v)
        cur = cur.next
    return head

def list_to_array(head):
    res = []
    while head:
        res.append(head.val)
        head = head.next
    return res

lines = sys.stdin.read().strip().split('\\n')
arr = json.loads(lines[0])
head = build_list(arr)
result = ${functionName}(head)
print(json.dumps(list_to_array(result)))`;

    default:
      return userCode;
  }
}
