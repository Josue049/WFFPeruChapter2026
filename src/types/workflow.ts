export type SubmissionStatus = "pending" | "in_review" | "rejected" | "published";

export interface ArticleSubmission {
  id: number;
  author_name: string;
  author_lastname: string;
  author_photo: string;
  author_cargo: string;
  author_email: string;
  is_chapter_member: boolean;
  title: string;
  subtitle: string;
  body: string;
  status: SubmissionStatus | string;
  reviewer_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_id: number | null;
  published_article_id: number | null;
}

export interface ArticleSubmissionPublicResponse {
  id: number;
  status: string;
  message: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  before_data: Record<string, unknown> | unknown[] | null;
  after_data: Record<string, unknown> | unknown[] | null;
  created_at: string;
}
