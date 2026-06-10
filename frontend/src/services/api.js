import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "https://learning-platform-api-224f.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const courseAPI = {
  getAll: (params) => api.get("/courses", { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getPopular: () => api.get("/courses/popular"),
  getMyCourses: () => api.get("/courses/instructor/my-courses"),
};

export const categoryAPI = {
  getAll: () => api.get("/categories"),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
};

export const enrollmentAPI = {
  enroll: (courseId) => api.post("/enrollments", { courseId }),
  getMyEnrollments: () => api.get("/enrollments/my"),
  getOne: (id) => api.get(`/enrollments/${id}`),
  updateProgress: (id, lessonId) =>
    api.put(`/enrollments/${id}/progress`, { lessonId }),
  getStats: () => api.get("/enrollments/stats"),
};

export const lessonAPI = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getOne: (id) => api.get(`/lessons/${id}`),
  create: (courseId, data) => api.post(`/lessons/course/${courseId}`, data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
};

export const quizAPI = {
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getOne: (id) => api.get(`/quizzes/${id}`),
  submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  getResults: (id) => api.get(`/quizzes/${id}/results`),
};

export const reviewAPI = {
  getByCourse: (courseId) => api.get(`/reviews/course/${courseId}`),
  create: (courseId, data) => api.post(`/reviews/course/${courseId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export default api;
