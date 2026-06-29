export interface WorkspaceStateDto {
  id: string;
  userId: string;
  questionId: string | null;
  draftCode: string | null;
  language: string;
  editorSettings: EditorSettingsDto | null;
  lastSavedAt: string;
  updatedAt: string;
}

export interface EditorSettingsDto {
  fontSize?: number;
  theme?: string;
  tabSize?: number;
  wordWrap?: boolean;
}

export interface UpsertWorkspaceStateDto {
  questionId?: string | null;
  draftCode?: string | null;
  language?: string;
  editorSettings?: EditorSettingsDto | null;
}
