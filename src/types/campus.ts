export interface CampusStudent {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  must_change_password: boolean;
}

export interface CampusCourseSummary {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  percent: number;
  total_lessons: number;
  completed_lessons: number;
  state: "not_started" | "in_progress" | "completed";
  continue_lesson_id: number | null;
  assigned_at: string;
  completed_at: string | null;
}

export type LessonKind = "video" | "document" | "quiz";
export type LessonState = "locked" | "available" | "completed";

export interface CampusLessonItem {
  id: number;
  title: string;
  kind: LessonKind;
  required: boolean;
  state: LessonState;
  duration_seconds: number | null;
  watched_percent: number;
  best_score: number | null;
}

export interface CampusCourseDetail {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  percent: number;
  completed_at: string | null;
  continue_lesson_id: number | null;
  modules: { id: number; title: string; description: string | null; lessons: CampusLessonItem[] }[];
}

export interface QuizInfo {
  passing_score: number;
  max_attempts: number | null;
  attempts_used: number;
  attempts_left: number | null;
  best_score: number | null;
  passed: boolean;
  question_count: number;
  has_open_attempt: boolean;
  attempts: { id: number; submitted_at: string; score_percent: number; passed: boolean }[];
}

export interface CampusLesson {
  id: number;
  course_id: number;
  course_title: string;
  module_title: string;
  title: string;
  description: string | null;
  kind: LessonKind;
  state: LessonState;
  required: boolean;
  duration_seconds: number | null;
  threshold_percent: number;
  watched_percent: number;
  resume_position: number;
  completed: boolean;
  can_mark_complete: boolean;
  media_url: string | null;
  materials: { id: number; title: string; original_name: string; size: number; url: string }[];
  previous_id: number | null;
  next_id: number | null;
  next_state: LessonState | null;
  quiz: QuizInfo | null;
}

export interface QuizQuestionPublic {
  id: number;
  text: string;
  kind: "single" | "multiple" | "true_false";
  points: number;
  options: { id: number; text: string }[];
}

export interface QuizResult {
  attempt_id: number;
  score_percent: number;
  points_earned: number;
  points_total: number;
  passed: boolean;
  passing_score: number;
  attempts_used: number;
  attempts_left: number | null;
  feedback?: { question_id: number; correct: boolean }[];
}

export interface GradeItem {
  course_id: number;
  course_title: string;
  lesson_id: number;
  lesson_title: string;
  passing_score: number;
  best_score: number;
  passed: boolean;
  attempts: { id: number; submitted_at: string; score_percent: number; passed: boolean }[];
}

/* ---- administración ---- */
export interface AdminLesson {
  id: number;
  title: string;
  description: string | null;
  kind: LessonKind;
  required: boolean;
  position: number;
  has_file: boolean;
  file_original_name: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  completion_percent: number | null;
  quiz_passing_score: number;
  quiz_max_attempts: number | null;
  quiz_shuffle: boolean;
  quiz_show_feedback: boolean;
  question_count: number;
  materials: { id: number; title: string; original_name: string; size: number }[];
}

export interface AdminModule {
  id: number;
  title: string;
  description: string | null;
  position: number;
  lessons: AdminLesson[];
}

export interface AdminCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string | null;
  status: "draft" | "published" | "archived";
  completion_percent: number;
  sequential: boolean;
  enrolled_count: number;
  lesson_count: number;
  created_at: string;
  updated_at: string;
  modules?: AdminModule[];
  warning?: string | null;
}

export interface AdminQuestion {
  id?: number;
  text: string;
  kind: "single" | "multiple" | "true_false";
  points: number;
  explanation: string | null;
  options: { id?: number; text: string; is_correct: boolean }[];
}

export interface AdminStudent {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  is_active: boolean;
  must_change_password: boolean;
  locked: boolean;
  course_count: number;
  created_at: string;
  last_login_at: string | null;
  temporary_password?: string;
}

export interface CourseProgressRow {
  course_id: number;
  course_title: string;
  enrollment_id: number;
  enrollment_status: string;
  percent: number;
  completed_required: number;
  total_required: number;
  completed_at: string | null;
  last_activity: string | null;
  average_quiz_score: number | null;
  student?: AdminStudent;
  lessons?: {
    id: number;
    title: string;
    kind: LessonKind;
    required: boolean;
    completed: boolean;
    completed_at: string | null;
    watched_percent: number | null;
    attempts: number;
    best_score: number | null;
    passed: boolean;
  }[];
}
