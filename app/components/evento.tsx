import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";

type TagVariant = "primary" | "warning" | "default";

type Tag = {
  label: string;
  variant?: TagVariant;
};

type EventoProps = {
  month: string;
  day: string;
  title: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  avatarUrl?: string | null;
  tags?: Tag[];
  actionLabel?: string;
  actionHref?: string | null;
  summaryLabel?: string;
  summaryHref?: string | null;
  readingLabel?: string;
  readingHref?: string | null;
  onAction?: () => void;
  hideActionButton?: boolean;
  className?: string;
};

const badgeVariants: Record<TagVariant, string> = {
  warning:
    "border border-[#f2c94c]/35 bg-[#f2c94c] text-[#0f2747] dark:border-[#f2c94c]/30 dark:bg-[#f2c94c] dark:text-[#0f2747]",
  primary:
    "border border-[#f2c94c]/35 bg-[#ffd84d] text-[#0f2747] dark:border-[#f2c94c]/30 dark:bg-[#ffd84d] dark:text-[#0f2747]",
  default:
    "border border-[#f2c94c]/30 bg-[#fff1a8] text-[#0f2747] dark:border-[#f2c94c]/25 dark:bg-[#e7c94a] dark:text-[#0f2747]",
};

const formatTime = (time: string): string => {
  const normalized = time.trim();
  if (!normalized) return "";

  const match = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return normalized;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const isBaptismSubject = (value: string) =>
  value.toLowerCase().includes("baut") ||
  value.toLowerCase().includes("bapt");

export default function Evento({
  month,
  day,
  title,
  subject,
  teacher,
  startTime,
  endTime,
  avatarUrl,
  tags = [],
  actionLabel = "Unirse a la llamada",
  actionHref = null,
  summaryLabel = "Ver resumen IA",
  summaryHref = null,
  readingLabel = "Ir a la lectura",
  readingHref = null,
  onAction,
  hideActionButton = false,
  className = "",
}: EventoProps) {
  const resolvedAvatarUrl = avatarUrl?.trim() ?? "";
  const hasAvatar = resolvedAvatarUrl.length > 0;
  const isRemoteAvatar = hasAvatar && /^https?:\/\//i.test(resolvedAvatarUrl);
  const isExternalHref = Boolean(
    actionHref && /^https?:\/\//i.test(actionHref),
  );
  const showActionButton = Boolean(actionHref && !hideActionButton);
  const startLabel = formatTime(startTime);
  const endLabel = formatTime(endTime);
  const timeLabel =
    startLabel && endLabel
      ? `${startLabel} – ${endLabel}`
      : startLabel || endLabel;
  const baptismTheme = isBaptismSubject(subject);

  return (
    <section
      aria-label={title}
      className={`grid w-full grid-cols-1 overflow-hidden rounded-[1.5rem] border border-[#16325c]/14 bg-card shadow-[0_18px_45px_rgba(15,39,71,0.10)] sm:grid-cols-[110px_1fr] ${className}`}
    >
      {/* Fecha */}
      <aside
        className={`relative flex flex-row items-center justify-center gap-2 overflow-hidden p-4 text-white sm:flex-col sm:gap-1 sm:p-5 ${
          baptismTheme
            ? "bg-[linear-gradient(135deg,#0f2747_0%,#1d4ed8_58%,#60a5fa_100%)]"
            : "bg-[#0f2747]"
        }`}
      >
        {baptismTheme ? (
          <>
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />
            <span className="absolute -right-4 top-2 h-10 w-10 rounded-full bg-white/12 blur-xl" />
          </>
        ) : null}

        <span className="text-lg font-bold tracking-wider text-[#f2c94c]">
          {month.toUpperCase()}
        </span>
        <span className="text-4xl font-extrabold leading-none">{day}</span>
      </aside>

      {/* Contenido */}
      <div className="relative grid min-h-[140px] grid-cols-1 items-start gap-4 bg-card p-4 md:grid-cols-[auto_1fr_auto] md:items-center sm:p-5">
        {/* Avatar */}
        <div className="h-16 w-16 overflow-hidden rounded-[1.35rem] border border-[#0f2747]/18 bg-[#edf3fb] shadow-[0_12px_28px_rgba(15,39,71,0.12)] ring-1 ring-[#f2c94c]/45 dark:bg-[#101a33] sm:-mt-2 sm:h-20 sm:w-20">
          {hasAvatar ? (
            isRemoteAvatar ? (
              // Small DB avatars can come from arbitrary hosts that are not in next.config.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedAvatarUrl}
                alt={`Avatar de ${teacher || title}`}
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={resolvedAvatarUrl}
                alt={`Avatar de ${teacher || title}`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#dfe8f6] text-[#0f2747] dark:bg-[#16233b] dark:text-[#8ab4ff]">
              <UserRound className="h-8 w-8" aria-hidden />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground text-lg sm:text-xl font-extrabold">
              {title}
            </h2>

            {tags.map((tag, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold
                  ${badgeVariants[tag.variant ?? "default"]}`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <span className="text-muted-foreground text-sm">{subject}</span>

          <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold">
            <UserRound className="h-4 w-4 text-[#0f2747] dark:text-[#8ab4ff]" aria-hidden />
            {teacher}
          </div>

          {timeLabel ? (
            <span className="text-sm font-semibold text-[#0f2747] dark:text-[#8ab4ff]">
              {timeLabel}
            </span>
          ) : null}
        </div>

        {/* Acción */}
        {showActionButton || readingHref || summaryHref ? (
          <div className="flex flex-col gap-3 justify-start md:justify-end">
            {summaryHref ? (
              <Link
                href={summaryHref}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-lg border border-[#0f2747]/14 bg-white px-4 py-3 text-center text-xs font-extrabold text-[#0f2747] shadow-[0_10px_24px_rgba(15,39,71,0.08)] transition-all hover:scale-[1.02] hover:border-[#0f2747]/24 hover:bg-[#f5f8fd] md:w-auto dark:bg-[#101a33] dark:text-white dark:hover:bg-[#152241]"
              >
                {summaryLabel}
              </Link>
            ) : null}

            {readingHref ? (
              <Link
                href={readingHref}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-lg bg-[#0f2747] px-4 py-3 text-center text-xs font-extrabold text-white shadow-[0_12px_28px_rgba(15,39,71,0.18)] transition-all hover:scale-[1.02] hover:bg-[#12355f] md:w-auto"
              >
                {readingLabel}
              </Link>
            ) : null}

            {actionHref && !hideActionButton ? (
              <Link
                href={actionHref}
                onClick={onAction}
                target={isExternalHref ? "_blank" : undefined}
                rel={isExternalHref ? "noreferrer" : undefined}
                className="w-full rounded-lg bg-[#ffd84d] px-4 py-3 text-center text-sm font-extrabold text-[#152238] shadow-[0_12px_28px_rgba(242,201,76,0.26)] transition-all hover:scale-[1.02] hover:bg-[#f2c94c] md:w-auto"
              >
                {actionLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
