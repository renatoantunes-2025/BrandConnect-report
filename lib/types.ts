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
  format: string | null;
  product_theme: string | null;
  category: string | null;
  is_repost: boolean;
  profile_visits: number | null;
  link_clicks: number | null;
  notes: string | null;
};

export type EditorialPost = Post & {
  social_accounts: {
    platform: SocialAccount["platform"];
    username: string | null;
  };
};
