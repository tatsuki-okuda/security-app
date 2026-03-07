import { Result } from '../../../shared/fp/result';
import { QuizTemplateQuestion } from '../domain/quizTemplates';

import { CreateDrillOutput } from './dto/CreateDrillOutput';

export type CreateDrillError =
  | { type: 'VALIDATION'; fieldErrors: Record<string, string[]> }
  | { type: 'REPO'; message: string };

export type CreateDrillUseCase = (input: {
  title: string;
  scenarioType: string;
  channel: string;
  targetType: 'all' | 'specific' | 'random';
  targetCount?: number | null;
  targetUserIds?: string[] | null;
  subject: string;
  body: string;
  guidanceText: string;
  quiz?: QuizTemplateQuestion[];
  status: 'draft' | 'deliverable' | 'delivering';
}) => Promise<Result<CreateDrillOutput, CreateDrillError>>;
