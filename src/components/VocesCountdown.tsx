import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { EXTRA } from "../i18n/extra";

export interface VoicesSettings {
  submissions_mode?: string;
  submissions_starts_at?: string | null;
  submissions_ends_at?: string | null;
  is_submission_open: boolean;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function split(ms: number) {
  const safe = Math.max(0, ms);
  return {
    days: Math.floor(safe / DAY),
    hours: Math.floor((safe % DAY) / HOUR),
    minutes: Math.floor((safe % HOUR) / MINUTE),
  };
}

export function VocesCountdown({ settings }: { settings: VoicesSettings | null }) {
  const { language, locale } = useLanguage();
  const text = EXTRA[language];
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!settings) return null;

  const startsAt = settings.submissions_starts_at ? new Date(settings.submissions_starts_at).getTime() : null;
  const endsAt = settings.submissions_ends_at ? new Date(settings.submissions_ends_at).getTime() : null;
  const scheduled = settings.submissions_mode === "scheduled";

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString(locale, {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima",
    });

  let tone: "open" | "soon" | "urgent" | null = null;
  let label = "";
  let remaining: number | null = null;
  let dateLine = "";

  if (settings.is_submission_open) {
    if (endsAt && endsAt > now) {
      remaining = endsAt - now;
      tone = remaining <= DAY ? "urgent" : "open";
      label = remaining <= DAY ? text.lastDay : text.closesIn;
      dateLine = `${text.closesOn} ${formatDate(endsAt)} (Lima)`;
    } else {
      tone = "open";
      label = text.openNow;
    }
  } else if (scheduled && startsAt && startsAt > now) {
    remaining = startsAt - now;
    tone = "soon";
    label = text.opensIn;
    dateLine = `${text.opensOn} ${formatDate(startsAt)} (Lima)`;
  }

  if (!tone) return null;

  const parts = remaining !== null ? split(remaining) : null;

  return (
    <div className={`voces-countdown voces-countdown-${tone}`} role="status" aria-live="polite">
      <div className="voces-countdown-text">
        <strong>{label}</strong>
        {dateLine && <span>{dateLine}</span>}
      </div>

      {parts && (
        <div className="voces-countdown-clock" aria-hidden="true">
          <div>
            <b>{parts.days}</b>
            <small>{text.days}</small>
          </div>
          <div>
            <b>{String(parts.hours).padStart(2, "0")}</b>
            <small>{text.hours}</small>
          </div>
          <div>
            <b>{String(parts.minutes).padStart(2, "0")}</b>
            <small>{text.minutes}</small>
          </div>
        </div>
      )}
    </div>
  );
}
