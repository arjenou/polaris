import { createPostsListHandlers } from "../../../_lib/postsApi";

export const { onRequestGet, onRequestPost } = createPostsListHandlers("news_posts", "news");
