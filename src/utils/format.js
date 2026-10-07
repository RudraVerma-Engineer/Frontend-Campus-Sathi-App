export const fullName = (user) => {
  const f = user?.fullname;
  if (!f) return "";
  if (typeof f === "string") return f;
  return [f.firstname, f.lastname].filter(Boolean).join(" ");
};

export const firstName = (user) =>
  (typeof user?.fullname === "object" ? user.fullname?.firstname : fullName(user)) || "there";

export const initials = (user) =>
  (fullName(user) || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  return formatDate(date);
};

export const formatDate = (date, opts = { day: "numeric", month: "short", year: "numeric" }) =>
  date ? new Date(date).toLocaleDateString("en-IN", opts) : "";

export const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "";

// "14:30" -> "2:30 PM"
export const to12h = (hhmm = "") => {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export const daysUntil = (date) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);
