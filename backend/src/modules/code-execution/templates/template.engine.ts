import { buildArrayInputDriver } from "./array-input.template";
import { buildStringInputDriver } from "./string-input.template";
import { buildLinkedListDriver } from "./linked-list.template";
import { buildTreeDriver } from "./tree.template";
import { buildGraphDriver } from "./graph.template";
import { buildMatrixInputDriver } from "./matrix.template";
import { buildCustomDriver } from "./custom.template";

export type ExecutionTemplateType =
  | "ARRAY_INPUT"
  | "STRING_INPUT"
  | "LINKED_LIST"
  | "TREE"
  | "GRAPH"
  | "MATRIX"
  | "CUSTOM";

export interface TemplateQuestion {
  executionTemplate?: string | null;
  functionName?: string | null;
  returnType?: string | null;
}

/**
 * Central template engine.
 * Given a question with executionTemplate metadata + user code + language,
 * wraps the code in the appropriate test harness driver.
 */
export function buildDriverCode(
  question: TemplateQuestion,
  language: string,
  userCode: string,
  testInput: string
): string {
  const template = (question.executionTemplate || "CUSTOM").toUpperCase() as ExecutionTemplateType;
  const functionName = question.functionName || "solve";
  const returnType = question.returnType || "any";

  switch (template) {
    case "ARRAY_INPUT":
      return buildArrayInputDriver(language, userCode, functionName, returnType, testInput);

    case "STRING_INPUT":
      return buildStringInputDriver(language, userCode, functionName, returnType, testInput);

    case "LINKED_LIST":
      return buildLinkedListDriver(language, userCode, functionName, returnType, testInput);

    case "TREE":
      return buildTreeDriver(language, userCode, functionName, returnType, testInput);

    case "GRAPH":
      return buildGraphDriver(language, userCode, functionName, returnType, testInput);

    case "MATRIX":
      return buildMatrixInputDriver(language, userCode, functionName, returnType, testInput);

    case "CUSTOM":
    default:
      return buildCustomDriver(language, userCode, functionName, returnType, testInput);
  }
}
