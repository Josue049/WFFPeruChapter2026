export interface MuroCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
  position: number;
}

export interface MuroImage {
  id: number;
  url: string;
  width: number;
  height: number;
  position: number;
}

export interface MuroCard {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  category: MuroCategory | null;
  cover: MuroImage | null;
  published_at: string | null;
}

export interface MuroPage {
  items: MuroCard[];
  total: number;
  offset: number;
  limit: number;
}

export interface MuroPostPublic {
  id: number;
  slug: string;
  title: string;
  author_name: string;
  body: string;
  category: MuroCategory | null;
  images: MuroImage[];
  published_at: string | null;
}

export type MuroStatus = "pending" | "approved" | "observed" | "rejected" | "withdrawn";

export interface MuroPostAdmin {
  id: number;
  slug: string;
  title: string;
  author_name: string;
  author_email: string;
  body: string;
  category: MuroCategory | null;
  status: MuroStatus;
  reviewer_notes: string | null;
  images: MuroImage[];
  submitted_at: string;
  updated_at: string;
  reviewed_at: string | null;
  published_at: string | null;
}

export interface MuroAdminPage {
  items: MuroPostAdmin[];
  total: number;
  counts: Record<MuroStatus, number>;
}

export interface MuroAuthorView {
  id: number;
  status: MuroStatus;
  title: string;
  author_name: string;
  body: string;
  category_id: number | null;
  reviewer_notes: string | null;
  images: MuroImage[];
  submitted_at: string;
}
