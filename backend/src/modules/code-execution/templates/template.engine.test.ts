import { describe, it, expect } from "vitest";
import { buildDriverCode } from "./template.engine";

describe("Execution Template Engine", () => {
  it("should wrap ARRAY_INPUT template correctly for javascript", () => {
    const question = { executionTemplate: "ARRAY_INPUT" };
    const userCode = "function solve(nums) { return nums; }";
    
    const result = buildDriverCode(question, "javascript", userCode, "");
    
    expect(result).toContain(userCode);
    expect(result).toContain("const fs = require('fs');");
    expect(result).toContain("const result = solve(...args);");
  });

  it("should wrap STRING_INPUT template correctly for python", () => {
    const question = { executionTemplate: "STRING_INPUT", functionName: "reverseString" };
    const userCode = "def reverseString(s):\n    return s[::-1]";
    
    const result = buildDriverCode(question, "python", userCode, "");
    
    expect(result).toContain(userCode);
    expect(result).toContain("import sys, json");
    expect(result).toContain("result = reverseString(s)");
  });

  it("should return user code unchanged for CUSTOM template", () => {
    const question = { executionTemplate: "CUSTOM" };
    const userCode = "print('Hello World')";
    
    const result = buildDriverCode(question, "python", userCode, "");
    
    expect(result).toBe(userCode);
  });

  it("should default to CUSTOM if no template is provided", () => {
    const question = {};
    const userCode = "console.log('test');";
    
    const result = buildDriverCode(question, "javascript", userCode, "");
    
    expect(result).toBe(userCode);
  });
});
