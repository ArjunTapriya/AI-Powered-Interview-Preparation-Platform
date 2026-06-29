/**
 * Custom Template (fallback)
 * For questions that don't fit a standard template, or System Design / Behavioral.
 * Returns user code unchanged — Judge0 evaluates raw code with raw stdin.
 */
export function buildCustomDriver(
  _language: string,
  userCode: string,
  _functionName: string,
  _returnType: string,
  _testInput: string
): string {
  return userCode;
}
