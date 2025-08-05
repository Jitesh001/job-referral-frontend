import dayjs from "dayjs";

export const JOB_MODES = [
  {
    label: "WFO",
    value: "WORK_FROM_OFFICE",
  },
  { label: "WFH", value: "WORK_FROM_HOME" },
  { label: "Hybrid", value: "HYBRID" },
];

export const convertUtcToLocalFormatted = (utcString) => {
  const date = new Date(utcString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export function formatDateForApi(date) {
  if (!date) return null;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
}
