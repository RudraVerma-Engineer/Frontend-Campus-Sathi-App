import { api, getErrorMessage } from "../config/api.js";

const call = async (fn) => {
  try {
    return (await fn()).data;
  } catch (error) {
    const err = new Error(getErrorMessage(error));
    err.status = error.response?.status;
    throw err;
  }
};

/* notices */
export const noticeService = {
  list: (params) => call(() => api.get("/notices", { params })),
  get: (id) => call(() => api.get(`/notices/${id}`)),
  markRead: (id) => call(() => api.post(`/notices/read/${id}`)),
  create: (body) => call(() => api.post("/notices/create", body)),
  mine: () => call(() => api.get("/notices/my-notices")),
};

/* events */
export const eventService = {
  list: (params) => call(() => api.get("/events", { params })),
  get: (id) => call(() => api.get(`/events/${id}`)),
  register: (id) => call(() => api.post(`/events/register/${id}`)),
  cancel: (id) => call(() => api.delete(`/events/register/${id}`)),
  mine: () => call(() => api.get("/events/my-events")),
};

/* timetable / subjects / sections */
export const timetableService = {
  mine: () => call(() => api.get("/timetable/my")),
};
export const subjectService = {
  list: (params) => call(() => api.get("/subject", { params })),
};

/* attendance */
export const attendanceService = {
  summary: (studentId) => call(() => api.get(`/attendance-record/student/${studentId}`)),
  scan: (qrToken) => call(() => api.post("/attendance-qr/scan", { qrToken })),
  startSession: (timetableId) =>
    call(() => api.post(`/attendance-session/from-timetable/${timetableId}`)),
  generateQR: (sessionId) => call(() => api.post(`/attendance-qr/generate/${sessionId}`)),
  roster: (sessionId) => call(() => api.get(`/attendance-session/${sessionId}/roster`)),
  mark: (sessionId, records) =>
    call(() => api.post(`/attendance-record/mark/${sessionId}`, { records })),
  sessions: (params) => call(() => api.get("/attendance-session", { params })),
  defaulters: (params) => call(() => api.get("/attendance-analytics/defaulters", { params })),
};

/* assignments */
export const assignmentService = {
  list: () => call(() => api.get("/assignments")),
  get: (id) => call(() => api.get(`/assignments/${id}`)),
  submit: (id, body) => call(() => api.post(`/assignments/${id}/submit`, body)),
  grade: (id, studentId, body) =>
    call(() => api.patch(`/assignments/${id}/grade/${studentId}`, body)),
};

/* placements */
export const placementService = {
  list: (params) => call(() => api.get("/placements", { params })),
  get: (id) => call(() => api.get(`/placements/${id}`)),
  stats: () => call(() => api.get("/placements/stats")),
  apply: (id) => call(() => api.post(`/placements/${id}/apply`)),
};
