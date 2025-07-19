CREATE TABLE "email_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"recipient_emails" json NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"sent_by" integer,
	"status" varchar(50) DEFAULT 'sent'
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_answer" varchar(1),
	"is_correct" boolean NOT NULL,
	"time_spent" integer,
	"answered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attempts" ALTER COLUMN "completed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "started_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "time_spent" integer;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_sent_by_admin_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;