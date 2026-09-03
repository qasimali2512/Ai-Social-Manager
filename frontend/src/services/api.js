import axios from "axios";

import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/* ============================================
   AUTH TOKEN
============================================ */

api.interceptors.request.use(
  async (config) => {
    try {
      const {
        data,
      } = await supabase.auth.getSession();

      const accessToken =
        data?.session?.access_token;

      if (accessToken) {
        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error(
        "Could not read Supabase session:",
        error
      );
    }

    return config;
  }
);

/* ============================================
   ERROR HANDLER
============================================ */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.response?.data?.error;

    const message =
      detail ||
      error?.message ||
      "Something went wrong.";

    return Promise.reject(
      new Error(message)
    );
  }
);

/* ============================================
   PLATFORMS
============================================ */

export async function getPlatforms() {
  const response = await api.get(
    "/api/platforms"
  );

  return (
    response.data?.platforms ||
    response.data?.items ||
    response.data?.data ||
    response.data ||
    []
  );
}

/* ============================================
   SOCIAL ACCOUNTS
============================================ */

export async function getSocialAccounts() {
  const response = await api.get(
    "/api/social-accounts"
  );

  return (
    response.data?.accounts ||
    response.data?.items ||
    response.data?.data ||
    response.data ||
    []
  );
}

export async function getSocialAccount(
  accountId
) {
  const response = await api.get(
    `/api/social-accounts/${accountId}`
  );

  return (
    response.data?.account ||
    response.data
  );
}

export async function updateSocialAccount(
  accountId,
  data
) {
  const response = await api.patch(
    `/api/social-accounts/${accountId}`,
    data
  );

  return (
    response.data?.account ||
    response.data
  );
}

export async function deleteSocialAccount(
  accountId
) {
  const response = await api.delete(
    `/api/social-accounts/${accountId}`
  );

  return response.data;
}

/* ============================================
   OAUTH
============================================ */

export async function getOAuthAuthorizationUrl(
  platform
) {
  const key = String(
    platform || ""
  )
    .toLowerCase()
    .trim();

  if (!key) {
    throw new Error(
      "OAuth platform is required."
    );
  }

  const response = await api.get(
    `/api/oauth/${encodeURIComponent(
      key
    )}/connect`
  );

  if (
    !response.data?.authorization_url
  ) {
    throw new Error(
      "OAuth authorization URL was not returned."
    );
  }

  return response.data;
}

export async function connectSocialAccount(
  platform
) {
  const result =
    await getOAuthAuthorizationUrl(
      platform
    );

  window.location.assign(
    result.authorization_url
  );

  return result;
}

/* ============================================
   POSTS
============================================ */

export async function getPosts() {
  const response = await api.get(
    "/api/posts/"
  );

  return (
    response.data?.posts ||
    response.data?.items ||
    response.data?.data ||
    response.data ||
    []
  );
}

export async function createPost(
  data
) {
  const response = await api.post(
    "/api/posts/",
    data
  );

  return response.data;
}

export async function updatePost(
  postId,
  data
) {
  const response = await api.put(
    `/api/posts/${postId}`,
    data
  );

  return response.data;
}

export async function deletePost(
  postId
) {
  const response = await api.delete(
    `/api/posts/${postId}`
  );

  return response.data;
}

/* ============================================
   AI GENERATION
============================================ */

export async function generateAIContent(
  data
) {
  const response = await api.post(
    "/api/ai/generate",
    data
  );

  return response.data;
}

/* ============================================
   GENERIC API HELPERS
============================================ */

export async function apiGet(
  path,
  config = {}
) {
  const response = await api.get(
    path,
    config
  );

  return response.data;
}

export async function apiPost(
  path,
  data,
  config = {}
) {
  const response = await api.post(
    path,
    data,
    config
  );

  return response.data;
}

export async function apiPatch(
  path,
  data,
  config = {}
) {
  const response = await api.patch(
    path,
    data,
    config
  );

  return response.data;
}

export async function apiDelete(
  path,
  config = {}
) {
  const response = await api.delete(
    path,
    config
  );

  return response.data;
}

export default api;