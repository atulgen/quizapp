CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"score" integer,
	"passed" boolean,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"text" text NOT NULL,
	"options" text NOT NULL,
	"correct_answer" varchar(1) NOT NULL,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "admin_users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz_responses" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz_results" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admin_users" CASCADE;--> statement-breakpoint
DROP TABLE "quiz_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "quiz_categories" CASCADE;--> statement-breakpoint
DROP TABLE "quiz_questions" CASCADE;--> statement-breakpoint
DROP TABLE "quiz_responses" CASCADE;--> statement-breakpoint
DROP TABLE "quiz_results" CASCADE;--> statement-breakpoint
DROP TABLE "quiz_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_email_unique";--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_enrollment_number_unique";--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_category_id_quiz_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "title" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "email" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "passing_score" integer DEFAULT 70;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "total_questions";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "total_marks";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "passing_marks";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "enrollment_number";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "course";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "batch";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "updated_at";