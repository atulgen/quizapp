// / db/schema.ts
import { pgTable, serial, text, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  options: text('options').array().notNull(), // PostgreSQL array type
  answer: text('answer').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const quizResponses = pgTable('quiz_responses', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').references(() => quizzes.id),
  userAnswer: text('user_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});