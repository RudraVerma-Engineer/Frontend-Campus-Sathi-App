// Single source of truth for the visual language of Campus Sathi.
// Screens import these tokens inside their own StyleSheet.create(...) blocks.
export const colors = {
  primary: "#4F46E5",
  primaryDark: "#3730A3",
  primarySoft: "#EEF2FF",
  sky: "#0EA5E9",
  navy: "#07112B",
  bg: "#F5F7FC",
  card: "#FFFFFF",
  border: "#E5E7EB",
  borderSoft: "#F3F4F6",
  text: "#111827",
  textSoft: "#6B7280",
  textMute: "#9CA3AF",
  success: "#10B981",
  successSoft: "#D1FAE5",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
  info: "#3B82F6",
  infoSoft: "#DBEAFE",
  white: "#FFFFFF",
};

export const gradients = {
  brand: ["#4F46E5", "#0EA5E9"],
  violet: ["#6D28D9", "#EC4899"],
  emerald: ["#059669", "#0EA5E9"],
  amber: ["#D97706", "#EF4444"],
  night: ["#07112B", "#312E81"],
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const font = {
  h1: { fontSize: 26, fontWeight: "800", color: colors.text },
  h2: { fontSize: 20, fontWeight: "700", color: colors.text },
  h3: { fontSize: 16, fontWeight: "700", color: colors.text },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  small: { fontSize: 12, color: colors.textSoft },
};

export const shadow = {
  card: {
    shadowColor: "#1E1B4B",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lift: {
    shadowColor: "#4F46E5",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

// backend notice priority -> badge colours
export const priorityStyle = {
  high: { bg: colors.dangerSoft, text: colors.danger, label: "Urgent" },
  medium: { bg: colors.warningSoft, text: "#B45309", label: "Important" },
  low: { bg: colors.infoSoft, text: colors.info, label: "Info" },
};

export const attendanceColor = (pct) =>
  pct >= 75 ? colors.success : pct >= 65 ? colors.warning : colors.danger;

// placement application status -> badge colours
export const applicationStatusStyle = {
  applied: { bg: colors.infoSoft, text: colors.info, label: "Applied" },
  shortlisted: { bg: colors.successSoft, text: "#047857", label: "Shortlisted" },
  interview: { bg: colors.warningSoft, text: "#B45309", label: "Interview" },
  selected: { bg: "#EDE9FE", text: "#6D28D9", label: "Selected 🎉" },
  rejected: { bg: colors.dangerSoft, text: colors.danger, label: "Not selected" },
};

// assignment state -> badge colours
export const assignmentStateStyle = {
  pending: { bg: colors.infoSoft, text: colors.info, label: "Pending" },
  submitted: { bg: colors.successSoft, text: "#047857", label: "Submitted" },
  graded: { bg: "#EDE9FE", text: "#6D28D9", label: "Graded" },
  overdue: { bg: colors.dangerSoft, text: colors.danger, label: "Overdue" },
};
