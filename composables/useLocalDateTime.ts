const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIMEZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;

export const useLocalDateTime = () => {
  const parseApiDateTime = (value?: string | null): Date | null => {
    const raw = String(value ?? "").trim();
    if (raw === "") {
      return null;
    }

    if (DATE_ONLY_PATTERN.test(raw)) {
      const date = new Date(`${raw}T00:00:00`);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const normalized = raw.replace(" ", "T");
    const withTimezone = TIMEZONE_PATTERN.test(normalized) ? normalized : `${normalized}Z`;
    const date = new Date(withTimezone);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatLocalDateTime = (value?: string | null, locale?: string, fallback = "-"): string => {
    const date = parseApiDateTime(value);
    if (!date) {
      return fallback;
    }

    return new Intl.DateTimeFormat(locale || undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatLocalDate = (value?: string | null, locale?: string, fallback = "-"): string => {
    const date = parseApiDateTime(value);
    if (!date) {
      return fallback;
    }

    return new Intl.DateTimeFormat(locale || undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  return {
    parseApiDateTime,
    formatLocalDate,
    formatLocalDateTime,
  };
};

export default useLocalDateTime;
