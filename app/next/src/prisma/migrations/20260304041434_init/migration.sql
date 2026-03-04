-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "DrillStatus" AS ENUM ('draft', 'deliverable', 'delivering', 'sent', 'stopped', 'failed');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('pending', 'scheduled', 'sent', 'failed', 'bounced', 'cancelled');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('send', 'click', 'learn', 'quiz_start', 'quiz_submit', 'complete', 'opt_out');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('single_choice', 'multiple_choice', 'text');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('submit', 'approve', 'reject', 'stop', 'fail');

-- CreateEnum
CREATE TYPE "OptOutStatus" AS ENUM ('requested', 'accepted', 'revoked');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "slack_user_id" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "opted_out" BOOLEAN NOT NULL DEFAULT false,
    "opt_out_reason" TEXT,
    "opted_out_at" TIMESTAMP(3),
    "consented_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drills" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "scenario_id" TEXT,
    "status" "DrillStatus" NOT NULL DEFAULT 'draft',
    "channel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "guidance_text" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_tokens" (
    "id" UUID NOT NULL,
    "drill_id" UUID NOT NULL,
    "drill_recipient_id" UUID,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drill_recipients" (
    "id" UUID NOT NULL,
    "drill_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "delivery_channel_id" UUID NOT NULL,
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'pending',
    "delivery_error" TEXT,
    "delivered_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "learned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drill_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_channels" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" UUID NOT NULL,
    "drill_id" UUID NOT NULL,
    "user_id" UUID,
    "tracking_token_id" UUID,
    "type" "InteractionType" NOT NULL,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "drill_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "question_type" "QuestionType" NOT NULL DEFAULT 'single_choice',
    "question_text" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "option_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" UUID NOT NULL,
    "drill_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "attempt_no" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "is_passed" BOOLEAN NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "feedback" JSONB,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_option_id" UUID,
    "selected_option_ids" JSONB,
    "text_answer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_history" (
    "id" UUID NOT NULL,
    "drill_id" UUID NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opt_out_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reason" TEXT,
    "status" "OptOutStatus" NOT NULL DEFAULT 'requested',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opt_out_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slack_user_id_key" ON "users"("slack_user_id");

-- CreateIndex
CREATE INDEX "drills_status_idx" ON "drills"("status");

-- CreateIndex
CREATE INDEX "drills_channel_idx" ON "drills"("channel");

-- CreateIndex
CREATE INDEX "drills_sent_at_idx" ON "drills"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_tokens_token_key" ON "tracking_tokens"("token");

-- CreateIndex
CREATE INDEX "tracking_tokens_drill_id_idx" ON "tracking_tokens"("drill_id");

-- CreateIndex
CREATE INDEX "drill_recipients_drill_id_idx" ON "drill_recipients"("drill_id");

-- CreateIndex
CREATE INDEX "drill_recipients_user_id_idx" ON "drill_recipients"("user_id");

-- CreateIndex
CREATE INDEX "drill_recipients_delivery_status_idx" ON "drill_recipients"("delivery_status");

-- CreateIndex
CREATE INDEX "drill_recipients_delivery_channel_id_idx" ON "drill_recipients"("delivery_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "drill_recipients_drill_id_user_id_delivery_channel_id_key" ON "drill_recipients"("drill_id", "user_id", "delivery_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_channels_code_key" ON "delivery_channels"("code");

-- CreateIndex
CREATE INDEX "idx_interactions_drill_type_time" ON "interactions"("drill_id", "type", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_interactions_user_time" ON "interactions"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_quiz_questions_drill_order" ON "quiz_questions"("drill_id", "order");

-- CreateIndex
CREATE INDEX "idx_quiz_options_question" ON "quiz_options"("question_id");

-- CreateIndex
CREATE INDEX "idx_quiz_options_correct" ON "quiz_options"("question_id", "is_correct");

-- CreateIndex
CREATE INDEX "idx_quiz_attempts_user_drill" ON "quiz_attempts"("user_id", "drill_id", "submitted_at");

-- CreateIndex
CREATE INDEX "idx_quiz_attempts_passed" ON "quiz_attempts"("drill_id", "is_passed");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempts_drill_id_user_id_attempt_no_key" ON "quiz_attempts"("drill_id", "user_id", "attempt_no");

-- CreateIndex
CREATE INDEX "idx_quiz_answers_attempt" ON "quiz_answers"("attempt_id");

-- CreateIndex
CREATE INDEX "idx_quiz_answers_question" ON "quiz_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_attempt_id_question_id_key" ON "quiz_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE INDEX "idx_approval_history_drill" ON "approval_history"("drill_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_opt_out_user" ON "opt_out_requests"("user_id", "requested_at");

-- AddForeignKey
ALTER TABLE "drills" ADD CONSTRAINT "drills_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drills" ADD CONSTRAINT "drills_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_tokens" ADD CONSTRAINT "tracking_tokens_drill_id_fkey" FOREIGN KEY ("drill_id") REFERENCES "drills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_tokens" ADD CONSTRAINT "tracking_tokens_drill_recipient_id_fkey" FOREIGN KEY ("drill_recipient_id") REFERENCES "drill_recipients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drill_recipients" ADD CONSTRAINT "drill_recipients_drill_id_fkey" FOREIGN KEY ("drill_id") REFERENCES "drills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drill_recipients" ADD CONSTRAINT "drill_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drill_recipients" ADD CONSTRAINT "drill_recipients_delivery_channel_id_fkey" FOREIGN KEY ("delivery_channel_id") REFERENCES "delivery_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_drill_id_fkey" FOREIGN KEY ("drill_id") REFERENCES "drills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_tracking_token_id_fkey" FOREIGN KEY ("tracking_token_id") REFERENCES "tracking_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_drill_id_fkey" FOREIGN KEY ("drill_id") REFERENCES "drills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_drill_id_fkey" FOREIGN KEY ("drill_id") REFERENCES "drills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "quiz_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_history" ADD CONSTRAINT "approval_history_drill_id_fkey" FOREIGN KEY ("drill_id") REFERENCES "drills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_history" ADD CONSTRAINT "approval_history_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opt_out_requests" ADD CONSTRAINT "opt_out_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
