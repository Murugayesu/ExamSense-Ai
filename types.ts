
export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Depth {
  BASIC = 'Basic',
  CONCEPTUAL = 'Conceptual',
  NUMERICAL = 'Numerical/Derivation',
  APPLICATION = 'Application'
}

export interface SyllabusTopic {
  name: string;
  priority: Priority;
  depth: Depth;
  reasoning: string;
}

export interface SyllabusUnit {
  title: string;
  topics: SyllabusTopic[];
}

export interface StudyPlan {
  masterNow: string[];
  deepDive: string[];
  quickRevision: string[];
}

export interface ExamAnalysis {
  syllabus: SyllabusUnit[];
  keyInsights: string[];
  studyPlan: StudyPlan;
}
