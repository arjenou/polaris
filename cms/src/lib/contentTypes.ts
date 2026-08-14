import { newsApi, recommendedApi, type ContentApi } from "./api";

export type ContentTypeKey = "news" | "recommended";

export interface ContentTypeConfig {
  api: ContentApi;
  /** CMS admin route base, e.g. "/news" (mounted under the /admin basename). */
  basePath: string;
  mediaFolder: string;
  labels: {
    navLabel: string;
    listTitle: string;
    newButtonLabel: string;
    createTitle: string;
    editTitle: string;
  };
}

export const CONTENT_TYPES: Record<ContentTypeKey, ContentTypeConfig> = {
  news: {
    api: newsApi,
    basePath: "/news",
    mediaFolder: "news",
    labels: {
      navLabel: "新闻公告",
      listTitle: "新闻公告",
      newButtonLabel: "+ 新建",
      createTitle: "新建新闻",
      editTitle: "编辑新闻",
    },
  },
  recommended: {
    api: recommendedApi,
    basePath: "/recommended",
    mediaFolder: "recommended",
    labels: {
      navLabel: "推荐信息",
      listTitle: "推荐信息",
      newButtonLabel: "+ 新建",
      createTitle: "新建推荐信息",
      editTitle: "编辑推荐信息",
    },
  },
};
