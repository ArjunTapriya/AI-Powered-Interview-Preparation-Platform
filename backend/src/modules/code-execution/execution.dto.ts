export interface RunCodeRequestDto {
  language: string;
  sourceCode: string;
  stdin?: string;
}

export interface RunCodeResponseDto {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: string;
  runtime: number | null; // in ms
  memory: number | null; // in KB
}

export interface SubmitCodeRequestDto {
  language: string;
  sourceCode: string;
}

export interface TestCaseExecutionResultDto {
  testCaseNumber: number;
  passed: boolean;
  expectedOutput?: string | null;
  actualOutput?: string | null;
  executionTime?: number | null; // in ms
}

export interface SubmitCodeResponseDto {
  status: string; // e.g. "ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "COMPILE_ERROR", "RUNTIME_ERROR"
  passedTests: number;
  totalTests: number;
  runtime: number | null;
  memory: number | null;
  stdout?: string | null;
  stderr?: string | null;
  executionResults?: TestCaseExecutionResultDto[];
}

export interface SubmissionResponseDto {
  id: string;
  userId: string;
  questionId: string;
  questionTitle?: string;
  language: string;
  sourceCode: string;
  status: string;
  passedTests: number;
  totalTests: number;
  runtime: number | null;
  memory: number | null;
  stdout: string | null;
  stderr: string | null;
  createdAt: string;
}
