CREATE TABLE "internship_acceptances" (
	"id" serial PRIMARY KEY NOT NULL,
	"offer_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"phone" varchar(20) NOT NULL,
	"father_name" varchar(100) NOT NULL,
	"permanent_address" text NOT NULL,
	"resume_url" varchar(500) NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "internship_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"email" varchar(100) NOT NULL,
	"token" varchar(255) NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'sent',
	"accepted_at" timestamp,
	CONSTRAINT "internship_offers_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "internship_acceptances" ADD CONSTRAINT "internship_acceptances_offer_id_internship_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_acceptances" ADD CONSTRAINT "internship_acceptances_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offers" ADD CONSTRAINT "internship_offers_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;