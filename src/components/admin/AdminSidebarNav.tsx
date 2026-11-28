import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminSection } from "../../types";
import styles from "./AdminSidebarNav.module.css";

interface Group {
  id: string;
  label: string;
  items: AdminSection[];
}

const GROUPS: Group[] = [
  { id: "content", label: "Contenido", items: ["articles", "muro", "milestones", "volunteers"] },
  { id: "certificates", label: "Certificación", items: ["certificates"] },
  { id: "site", label: "Sitio web", items: ["banners", "sections"] },
  { id: "admin", label: "Administración", items: ["users", "audit"] },
];

const STORAGE_KEY = "wff.admin.navCollapsed";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const ICONS: Record<AdminSection, ReactNode> = {
  articles: (
    <Icon>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h7M9 17h7" />
    </Icon>
  ),
  muro: (
    <Icon>
      <rect x="3" y="3" width="8" height="10" rx="2" />
      <rect x="13" y="3" width="8" height="6" rx="2" />
      <rect x="13" y="11" width="8" height="10" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </Icon>
  ),
  milestones: (
    <Icon>
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
    </Icon>
  ),
  volunteers: (
    <Icon>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Icon>
  ),
  certificates: (
    <Icon>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M7 8h10M7 12h5" />
      <circle cx="16" cy="16" r="2.6" />
      <path d="m14.6 18.4-.8 3 2.2-1.2 2.2 1.2-.8-3" />
    </Icon>
  ),
  banners: (
    <Icon>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="m3 14 5-4 4 3 3-2 6 4M9 20h6" />
    </Icon>
  ),
  sections: (
    <Icon>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="8" cy="17" r="2.2" />
    </Icon>
  ),
  users: (
    <Icon>
      <circle cx="8" cy="12" r="3.2" />
      <path d="M11 12h10M17 12v3M20 12v2" />
    </Icon>
  ),
  audit: (
    <Icon>
      <path d="M4 5h16M4 12h10M4 19h7" />
      <circle cx="18" cy="17" r="3" />
      <path d="m20.3 19.3 1.7 1.7" />
    </Icon>
  ),
};

function readCollapsed(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

interface AdminSidebarNavProps {
  /** Secciones a las que la cuenta tiene acceso. */
  sections: AdminSection[];
  active: AdminSection;
  labels: Record<AdminSection, string>;
  /** Pendientes de revisión por sección (insignia). */
  badges: Partial<Record<AdminSection, number>>;
  onChoose: (section: AdminSection) => void;
}

export function AdminSidebarNav({ sections, active, labels, badges, onChoose }: AdminSidebarNavProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(readCollapsed);

  const groups = useMemo(
    () =>
      GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => sections.includes(item)) })).filter(
        (group) => group.items.length > 0,
      ),
    [sections],
  );

  const toggle = (id: string) => {
    setCollapsed((current) => {
      const next = { ...current, [id]: !current[id] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Sin almacenamiento: el plegado solo dura mientras la página está abierta.
      }
      return next;
    });
  };

  return (
    <nav className={styles.nav} aria-label="Secciones administrativas">
      {groups.map((group) => {
        const hasActive = group.items.includes(active);
        // El grupo de la sección actual siempre queda abierto, para no perder de vista dónde estás.
        const open = hasActive || !collapsed[group.id];
        const pending = group.items.reduce((sum, item) => sum + (badges[item] ?? 0), 0);
        const listId = `nav-group-${group.id}`;

        return (
          <div key={group.id} className={styles.group}>
            <button
              type="button"
              className={styles.groupHead}
              aria-expanded={open}
              aria-controls={listId}
              disabled={hasActive}
              onClick={() => toggle(group.id)}
            >
              <span>{group.label}</span>
              {!open && pending > 0 && (
                <span className={styles.groupDot} title={`${pending} pendientes`} aria-label={`${pending} pendientes`}>
                  {formatBadge(pending)}
                </span>
              )}
              <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {open && (
              <ul id={listId} className={styles.list}>
                {group.items.map((item) => {
                  const count = badges[item];
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        className={`${styles.item} ${item === active ? styles.itemActive : ""}`}
                        aria-current={item === active ? "page" : undefined}
                        onClick={() => onChoose(item)}
                      >
                        <span className={styles.icon}>{ICONS[item]}</span>
                        <span className={styles.label}>{labels[item]}</span>
                        {count !== undefined && (
                          <span className={`${styles.badge} ${count === 0 ? styles.badgeEmpty : ""}`} title={`${count} pendientes de revisar`} aria-label={`${count} pendientes de revisar`}>
                            {formatBadge(count)}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
