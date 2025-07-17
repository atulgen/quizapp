CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"role" varchar(50) DEFAULT 'admin',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer,
	"student_id" integer,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"total_questions" integer,
	"answered_questions" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"wrong_answers" integer DEFAULT 0,
	"total_marks" numeric(10, 2) DEFAULT '0',
	"obtained_marks" numeric(10, 2) DEFAULT '0',
	"percentage" numeric(5, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'in_progress',
	"is_passed" boolean DEFAULT false,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer,
	"question" text NOT NULL,
	"question_type" varchar(50) DEFAULT 'multiple_choice',
	"options" json,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"marks" numeric(5, 2) DEFAULT '1',
	"difficulty" varchar(20) DEFAULT 'medium',
	"order_index" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer,
	"quiz_id" integer,
	"student_id" integer,
	"student_name" varchar(255),
	"student_email" varchar(255),
	"enrollment_number" varchar(100),
	"quiz_title" varchar(255),
	"total_questions" integer,
	"correct_answers" integer,
	"wrong_answers" integer,
	"unanswered_questions" integer,
	"total_marks" numeric(10, 2),
	"obtained_marks" numeric(10, 2),
	"percentage" numeric(5, 2),
	"grade" varchar(10),
	"is_passed" boolean,
	"time_taken" integer,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer,
	"allow_retakes" boolean DEFAULT false,
	"max_attempts" integer DEFAULT 1,
	"shuffle_questions" boolean DEFAULT false,
	"shuffle_options" boolean DEFAULT false,
	"show_results_immediately" boolean DEFAULT true,
	"show_correct_answers" boolean DEFAULT true,
	"require_student_details" boolean DEFAULT true,
	"allow_pause" boolean DEFAULT false,
	"proctoring" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"enrollment_number" varchar(100) NOT NULL,
	"course" varchar(255),
	"batch" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "students_email_unique" UNIQUE("email"),
	CONSTRAINT "students_enrollment_number_unique" UNIQUE("enrollment_number")
);
--> statement-breakpoint
ALTER TABLE "quiz_responses" DROP CONSTRAINT "quiz_responses_quiz_id_quizzes_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_responses" ALTER COLUMN "user_answer" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_responses" ALTER COLUMN "is_correct" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "quiz_responses" ALTER COLUMN "is_correct" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD COLUMN "attempt_id" integer;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD COLUMN "question_id" integer;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD COLUMN "student_id" integer;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD COLUMN "correct_answer" text;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD COLUMN "marks_obtained" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD COLUMN "time_taken" integer;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD COLUMN "answered_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "time_limit" integer;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "total_questions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "total_marks" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "passing_marks" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "created_by" varchar(255);--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_settings" ADD CONSTRAINT "quiz_settings_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_category_id_quiz_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."quiz_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" DROP COLUMN "quiz_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "question";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "options";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "answer";