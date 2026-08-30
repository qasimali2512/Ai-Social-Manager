import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
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

  return response.data || [];
}

/* ============================================
   SOCIAL ACCOUNTS
============================================ */

export async function getSocialAccounts() {
  const response = await api.get(
    "/api/social-accounts"
  );

  return response.data?.accounts || [];
}

/* ============================================
   POSTS
============================================ */

export async function getPosts() {
  const response = await api.get(
    "/api/posts/"
  );

  return response.data?.posts || [];
}

export async function createPost(data) {
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

export async function deletePost(postId) {
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

export default api;