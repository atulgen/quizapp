ALTER TABLE "questions" ALTER COLUMN "correct_answer" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "selected_answer" SET DATA TYPE varchar(1);