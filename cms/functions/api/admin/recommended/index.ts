import { createPostsListHandlers } from "../../../_lib/postsApi";

export const { onRequestGet, onRequestPost } = createPostsListHandlers("recommended_posts", "recommended");
