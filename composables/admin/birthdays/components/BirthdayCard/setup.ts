import { computed } from "vue";
import type { BirthdayCardProps } from "./index";

const STATUS_CLASS_MAP: Record<string, string> = {
  sent: "bg-[var(--color-success)] text-white",
  queued: "bg-[var(--ui-primary-main)] text-white",
  failed: "bg-[var(--ui-sticker-danger)] text-white",
  skipped: "bg-[var(--color-warning)] text-white",
};

export function useBirthdayCardSetup(props: BirthdayCardProps) {
  const avatarText = computed(() => props.item.initials || props.initials(props.item.full_name));
  const clientTo = computed(() => props.clientLink(props.item.user_id));

  const notificationTime = (value?: string | null): string => props.formatDateTime(value);

  const statusClass = (status: string): string =>
    STATUS_CLASS_MAP[status] ?? "bg-[var(--color-stroke-ui-light)] text-[var(--ui-text-main)]";

  return {
    avatarText,
    clientTo,
    notificationTime,
    statusClass,
  };
}
