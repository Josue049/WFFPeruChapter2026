export interface Milestone {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  event_date: string;
  category: string;
  location: string | null;
  cover_image: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface VolunteerStory {
  id: number;
  edition_number: number;
  name: string;
  slug: string;
  headline: string;
  introduction: string;
  content_html: string;
  quote: string | null;
  role: string | null;
  area: string | null;
  project: string | null;
  city: string | null;
  portrait_image: string;
  gallery: string[];
  linkedin_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface VolunteerHighlight {
  mode: "random" | "scheduled";
  story_id: number | null;
  starts_at: string | null;
  ends_at: string | null;
  updated_at: string | null;
}

export interface FeaturedVolunteer {
  story: VolunteerStory | null;
  selection_mode: "random" | "scheduled" | "empty";
  active_until: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  role: "administrator" | "editor" | "custom" | string;
  is_active: boolean;
  manage_articles: boolean;
  manage_milestones: boolean;
  manage_volunteers: boolean;
  manage_users: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export type AdminSection = "articles" | "milestones" | "volunteers" | "users";
