export type Client = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type SocialAccount = {
  id: string;
  client_id: string;
  platform: "instagram" | "facebook";
  external_account_id: string;
  username: string | null;
  display_name: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  social_account_id: string;
  upload_id: string | null;
  external_post_id: string;
  description: string | null;
  post_type: string | null;
  duration_seconds: number | null;
  permalink: string | null;
  published_at: string | null;
  views: number;
  reach: number;
  likes: number;
  shares: number;
  follows: number;
  comments: number;
  saves: number;
  updated_at: string;
};
