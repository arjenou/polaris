import { createPublicPostsHandlers } from "../../_lib/postsApi";

export const { onRequestGet, onRequestOptions } = createPublicPostsHandlers("recommended_posts");
