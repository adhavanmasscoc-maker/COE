-- Migration Index Script for Turso (libSQL) / SQLite
-- Task A & B Indexes
CREATE INDEX IF NOT EXISTS idx_activity_roll_action_time ON StudentActivityLog(rollNo, action, createdAt);
CREATE UNIQUE INDEX IF NOT EXISTS uq_qbank_subject_qno ON QuestionBankItem(subjectId, questionNumber);

-- Task C & D Indexes
-- C & D. Optimize ExamQuestion unique lookup and updates by examScheduleId + questionNumber
CREATE UNIQUE INDEX IF NOT EXISTS uq_examq_exam_qno ON ExamQuestion(examScheduleId, questionNumber);
