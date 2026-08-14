import { createPostAdminHandlers } from "../../../_lib/postsApi";

export const { onRequestGet, onRequestPut, onRequestDelete } = createPostAdminHandlers(
  "recommended_posts",
  "recommended",
  "推荐信息",
);
