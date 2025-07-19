CREATE TABLE "student_quiz_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'available',
	"attempts_used" integer DEFAULT 0,
	"first_accessed_at" timestamp,
	"last_accessed_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "options" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "correct_answer" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "time_limit" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "selected_answer" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "attempt_number" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "status" varchar(20) DEFAULT 'in_progress';--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "total_questions" integer;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "correct_answers" integer;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "points" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "valid_from" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "valid_until" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "max_attempts" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "student_quiz_status" ADD CONSTRAINT "student_quiz_status_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_quiz_status" ADD CONSTRAINT "student_quiz_status_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;