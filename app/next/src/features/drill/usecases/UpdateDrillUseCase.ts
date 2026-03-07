import { Result } from '../../../shared/fp/result';
import { QuizTemplateQuestion } from '../domain/quizTemplates';

export type UpdateDrillError =
  | { type: 'VALIDATION'; fieldErrors: Record<string, string[]> }
  | { type: 'REPO'; message: string };

export type UpdateDrillUseCase = (input: {
  drillId: string;
  channel: string;
  targetType: 'all' | 'specific' | 'random';
  targetCount?: number | null;
  targetUserIds?: string[] | null;
  subject: string;
  body: string;
  guidanceText: string;
  quiz: QuizTemplateQuestion[];
  status: 'draft' | 'deliverable' | 'delivering';
}) => Promise<Result<void, UpdateDrillError>>;
