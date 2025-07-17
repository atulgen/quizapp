// // db/schema.ts
// import { pgTable, serial, text, varchar, integer, timestamp, boolean, decimal, json } from 'drizzle-orm/pg-core';

// // Students table to store student details
// export const students = pgTable('students', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 255 }).notNull(),
//   email: varchar('email', { length: 255 }).notNull().unique(),
//   phone: varchar('phone', { length: 20 }),
//   enrollmentNumber: varchar('enrollment_number', { length: 100 }).notNull().unique(),
//   course: varchar('course', { length: 255 }),
//   batch: varchar('batch', { length: 100 }),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// });

// // Quiz categories/subjects for better organization
// export const quizCategories = pgTable('quiz_categories', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 255 }).notNull(),
//   description: text('description'),
//   isActive: boolean('is_active').default(true),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// });

// // Enhanced quizzes table
// export const quizzes = pgTable('quizzes', {
//   id: serial('id').primaryKey(),
//   title: varchar('title', { length: 255 }).notNull(),
//   description: text('description'),
//   categoryId: integer('category_id').references(() => quizCategories.id),
//   timeLimit: integer('time_limit'), // in minutes
//   totalQuestions: integer('total_questions').default(0),
//   totalMarks: decimal('total_marks', { precision: 10, scale: 2 }).default('0'),
//   passingMarks: decimal('passing_marks', { precision: 10, scale: 2 }).default('0'),
//   isActive: boolean('is_active').default(true),
//   startDate: timestamp('start_date'),
//   endDate: timestamp('end_date'),
//   createdBy: varchar('created_by', { length: 255 }), // admin who created
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// });

// // Individual questions for each quiz
// export const quizQuestions = pgTable('quiz_questions', {
//   id: serial('id').primaryKey(),
//   quizId: integer('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }),
//   question: text('question').notNull(),
//   questionType: varchar('question_type', { length: 50 }).default('multiple_choice'), // multiple_choice, true_false, short_answer
//   options: json('options'), // Store as JSON for flexibility
//   correctAnswer: text('correct_answer').notNull(),
//   explanation: text('explanation'), // Optional explanation for correct answer
//   marks: decimal('marks', { precision: 5, scale: 2 }).default('1'),
//   difficulty: varchar('difficulty', { length: 20 }).default('medium'), // easy, medium, hard
//   orderIndex: integer('order_index').default(0),
//   isActive: boolean('is_active').default(true),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// });

// // Quiz attempts/sessions
// export const quizAttempts = pgTable('quiz_attempts', {
//   id: serial('id').primaryKey(),
//   quizId: integer('quiz_id').references(() => quizzes.id),
//   studentId: integer('student_id').references(() => students.id),
//   startTime: timestamp('start_time').defaultNow(),
//   endTime: timestamp('end_time'),
//   totalQuestions: integer('total_questions'),
//   answeredQuestions: integer('answered_questions').default(0),
//   correctAnswers: integer('correct_answers').default(0),
//   wrongAnswers: integer('wrong_answers').default(0),
//   totalMarks: decimal('total_marks', { precision: 10, scale: 2 }).default('0'),
//   obtainedMarks: decimal('obtained_marks', { precision: 10, scale: 2 }).default('0'),
//   percentage: decimal('percentage', { precision: 5, scale: 2 }).default('0'),
//   status: varchar('status', { length: 20 }).default('in_progress'), // in_progress, completed, submitted, timed_out
//   isPassed: boolean('is_passed').default(false),
//   submittedAt: timestamp('submitted_at'),
//   createdAt: timestamp('created_at').defaultNow(),
// });

// // Individual question responses
// export const quizResponses = pgTable('quiz_responses', {
//   id: serial('id').primaryKey(),
//   attemptId: integer('attempt_id').references(() => quizAttempts.id, { onDelete: 'cascade' }),
//   questionId: integer('question_id').references(() => quizQuestions.id),
//   studentId: integer('student_id').references(() => students.id),
//   userAnswer: text('user_answer'),
//   correctAnswer: text('correct_answer'),
//   isCorrect: boolean('is_correct').default(false),
//   marksObtained: decimal('marks_obtained', { precision: 5, scale: 2 }).default('0'),
//   timeTaken: integer('time_taken'), // in seconds
//   answeredAt: timestamp('answered_at').defaultNow(),
//   createdAt: timestamp('created_at').defaultNow(),
// });

// // Quiz results summary (for faster reporting)
// export const quizResults = pgTable('quiz_results', {
//   id: serial('id').primaryKey(),
//   attemptId: integer('attempt_id').references(() => quizAttempts.id, { onDelete: 'cascade' }),
//   quizId: integer('quiz_id').references(() => quizzes.id),
//   studentId: integer('student_id').references(() => students.id),
//   studentName: varchar('student_name', { length: 255 }),
//   studentEmail: varchar('student_email', { length: 255 }),
//   enrollmentNumber: varchar('enrollment_number', { length: 100 }),
//   quizTitle: varchar('quiz_title', { length: 255 }),
//   totalQuestions: integer('total_questions'),
//   correctAnswers: integer('correct_answers'),
//   wrongAnswers: integer('wrong_answers'),
//   unansweredQuestions: integer('unanswered_questions'),
//   totalMarks: decimal('total_marks', { precision: 10, scale: 2 }),
//   obtainedMarks: decimal('obtained_marks', { precision: 10, scale: 2 }),
//   percentage: decimal('percentage', { precision: 5, scale: 2 }),
//   grade: varchar('grade', { length: 10 }), // A+, A, B+, B, C, D, F
//   isPassed: boolean('is_passed'),
//   timeTaken: integer('time_taken'), // total time in seconds
//   submittedAt: timestamp('submitted_at'),
//   createdAt: timestamp('created_at').defaultNow(),
// });

// // Admin users table
// export const adminUsers = pgTable('admin_users', {
//   id: serial('id').primaryKey(),
//   username: varchar('username', { length: 100 }).notNull().unique(),
//   email: varchar('email', { length: 255 }).notNull().unique(),
//   password: varchar('password', { length: 255 }).notNull(), // hashed password
//   firstName: varchar('first_name', { length: 100 }),
//   lastName: varchar('last_name', { length: 100 }),
//   role: varchar('role', { length: 50 }).default('admin'), // admin, super_admin, moderator
//   isActive: boolean('is_active').default(true),
//   lastLogin: timestamp('last_login'),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// });

// // Quiz settings/configurations
// export const quizSettings = pgTable('quiz_settings', {
//   id: serial('id').primaryKey(),
//   quizId: integer('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }),
//   allowRetakes: boolean('allow_retakes').default(false),
//   maxAttempts: integer('max_attempts').default(1),
//   shuffleQuestions: boolean('shuffle_questions').default(false),
//   shuffleOptions: boolean('shuffle_options').default(false),
//   showResultsImmediately: boolean('show_results_immediately').default(true),
//   showCorrectAnswers: boolean('show_correct_answers').default(true),
//   requireStudentDetails: boolean('require_student_details').default(true),
//   allowPause: boolean('allow_pause').default(false),
//   proctoring: boolean('proctoring').default(false),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// });

// // Export all tables for easy reference
// export type Student = typeof students.$inferSelect;
// export type NewStudent = typeof students.$inferInsert;

// export type Quiz = typeof quizzes.$inferSelect;
// export type NewQuiz = typeof quizzes.$inferInsert;

// export type QuizQuestion = typeof quizQuestions.$inferSelect;
// export type NewQuizQuestion = typeof quizQuestions.$inferInsert;

// export type QuizAttempt = typeof quizAttempts.$inferSelect;
// export type NewQuizAttempt = typeof quizAttempts.$inferInsert;

// export type QuizResponse = typeof quizResponses.$inferSelect;
// export type NewQuizResponse = typeof quizResponses.$inferInsert;

// export type QuizResult = typeof quizResults.$inferSelect;
// export type NewQuizResult = typeof quizResults.$inferInsert;

// export type AdminUser = typeof adminUsers.$inferSelect;
// export type NewAdminUser = typeof adminUsers.$inferInsert;



import { InferModel, relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';

// --- STUDENTS (Only name & email) ---
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Student = InferModel<typeof students>;
export type NewStudent = InferModel<typeof students, 'insert'>;

// --- QUIZZES (Tests) ---
export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  timeLimit: integer('time_limit'), // Minutes
  passingScore: integer('passing_score').default(70), // Percentage (e.g., 70%)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Quiz = InferModel<typeof quizzes>;
export type NewQuiz = InferModel<typeof quizzes, 'insert'>;

// --- QUESTIONS (For quizzes) ---
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  options: text('options').notNull(), // JSON or comma-separated (e.g., "A,B,C,D")
  correctAnswer: varchar('correct_answer', { length: 1 }).notNull(), // e.g., "A"
  order: integer('order').default(0),
});

export type Question = InferModel<typeof questions>;
export type NewQuestion = InferModel<typeof questions, 'insert'>;

// --- ATTEMPTS (Student test attempts) ---
export const attempts = pgTable('attempts', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').notNull().references(() => quizzes.id),
  studentId: integer('student_id').notNull().references(() => students.id),
  score: integer('score'), // Percentage (e.g., 85%)
  passed: boolean('passed'), // True if score >= passingScore
  completedAt: timestamp('completed_at').defaultNow(),
});

export type Attempt = InferModel<typeof attempts>;
export type NewAttempt = InferModel<typeof attempts, 'insert'>;

// --- ADMIN (For managing quizzes) --
export const admins = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // hashed password
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 50 }).default('admin'), // admin, super_admin, moderator
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Admin = InferModel<typeof admins>;
export type NewAdmin = InferModel<typeof admins, 'insert'>;

// ===== RELATIONS ===== //

export const studentsRelations = relations(students, ({ many }) => ({
  attempts: many(attempts),
}));

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  attempts: many(attempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [attempts.quizId],
    references: [quizzes.id],
  }),
  student: one(students, {
    fields: [attempts.studentId],
    references: [students.id],
  }),
}));

export const adminsRelations = relations(admins, () => ({}));