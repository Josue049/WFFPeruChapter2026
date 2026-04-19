import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { Article, TabType } from "../types";
import { useResizer } from "../hooks/useResizer";
import { useToast } from "../hooks/useToast";
import { ArticleList } from "../components/ArticleList";
import { ArticleEditor } from "../components/ArticleEditor";
import { ArticlePreview } from "../components/ArticlePreview";
import { DeleteModal } from "../components/DeleteModal";
import { Toast } from "../components/Toast";
import { EmptyState } from "../components/EmptyState";
import styles from "./Admin.module.css";

type Mode = "idle" | "edit";

const API = "http://127.0.0.1:8000";

// ── Wrapper: solo maneja auth ─────────────────────────────────
export default function Admin() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/LoginAdmin";
      return;
    }
    setToken(t);
    setReady(true);
  }, []);

  if (!ready || !token) return <div></div>;
  return <AdminPanel token={token} />;
}

// ── Panel real ────────────────────────────────────────────────
function AdminPanel({ token }: { token: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<TabType>("editor");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [previewData, setPreviewData] = useState<Partial<Article> | null>(null);

  const { toast, showToast } = useToast();

  const workAreaRef = useRef<HTMLDivElement>(null);
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const previewPanelRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  const { onMouseDown: onResizerMouseDown } = useResizer({
    containerRef: workAreaRef,
    editorRef: editorPanelRef,
    previewRef: previewPanelRef,
    enabled: previewOpen && !isMobile,
  });

  // ── Cargar artículos ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/articles`, { headers });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setArticles(
          data.map((a: any) => ({
            ...a,
            date: a.date ? a.date.split("T")[0] : "",
          })),
        );
      } catch (err) {
        console.error("Error cargando:", err);
        showToast("❌", "No se pudo conectar al servidor.");
      }
    };
    load();
  }, [headers]);

  // ── Responsive ──
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // ── Resizer: abrir preview ──
  useEffect(() => {
    if (!previewOpen || isMobile) return;
    const wa = workAreaRef.current;
    const ep = editorPanelRef.current;
    const pp = previewPanelRef.current;
    if (!wa || !ep || !pp) return;
    const totalW = wa.offsetWidth;
    const edW = Math.round(totalW * 0.5);
    ep.style.flex = "none";
    ep.style.width = `${edW}px`;
    pp.style.width = `${totalW - edW - 5}px`;
  }, [previewOpen, isMobile]);

  // ── Resizer: cerrar preview ──
  useEffect(() => {
    if (previewOpen || isMobile) return;
    const ep = editorPanelRef.current;
    if (ep) {
      ep.style.flex = "1";
      ep.style.width = "";
    }
  }, [previewOpen, isMobile]);

  const currentArticle = articles.find((a) => a.id === currentId) ?? null;

  // ── Seleccionar artículo ──
  const selectArticle = useCallback(
    (id: number) => {
      const art = articles.find((a) => a.id === id);
      setCurrentId(id);
      setMode("edit");
      setSidebarOpen(false);
      setMobileTab("editor");
      setPreviewData(art ? { ...art } : null);
    },
    [articles],
  );

  const newArticle = useCallback(() => {
    setCurrentId(null);
    setMode("edit");
    setSidebarOpen(false);
    setMobileTab("editor");
    setPreviewData(null);
  }, []);

  // ── Guardar ──
  const handleSave = useCallback(
    async (data: Omit<Article, "id">) => {
      try {
        if (currentId) {
          const res = await fetch(`${API}/articles/${currentId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Error al actualizar");
          const updated = await res.json();
          setArticles((prev) =>
            prev.map((a) =>
              a.id === currentId
                ? { ...updated, date: updated.date?.split("T")[0] ?? "" }
                : a,
            ),
          );
          showToast("✅", "Artículo actualizado.");
        } else {
          const res = await fetch(`${API}/articles`, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Error al crear");
          const created = await res.json();
          setArticles((prev) => [
            ...prev,
            { ...created, date: created.date?.split("T")[0] ?? "" },
          ]);
          setCurrentId(created.id);
          showToast("🚀", "Artículo publicado.");
        }
      } catch (err) {
        console.error(err);
        showToast("❌", "Error al guardar.");
      }
    },
    [currentId, headers],
  );

  // ── Eliminar ──
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTargetId === null) return;
    try {
      const res = await fetch(`${API}/articles/${deleteTargetId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setArticles((prev) => prev.filter((a) => a.id !== deleteTargetId));
      showToast("🗑️", "Artículo eliminado.");
    } catch (err) {
      console.error(err);
      showToast("❌", "Error al eliminar.");
    }
    setDeleteTargetId(null);
    setMode("idle");
    setCurrentId(null);
    setPreviewOpen(false);
    setPreviewData(null);
  }, [deleteTargetId, headers]);

  const handleDeleteRequest = useCallback(() => {
    if (currentId !== null) setDeleteTargetId(currentId);
  }, [currentId]);

  // ── UI helpers ──
  const togglePreview = useCallback(() => {
    if (isMobile) {
      setMobileTab("preview");
      return;
    }
    setPreviewOpen((v) => !v);
  }, [isMobile]);

  const handlePreviewDataChange = useCallback((data: Partial<Article>) => {
    setPreviewData(data);
  }, []);

  // ── Cerrar sesión ──
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    window.location.href = "/LoginAdmin";
  }, []);

  const showPreviewPanel =
    (previewOpen && !isMobile) || (isMobile && mobileTab === "preview");

  const hideEditor = isMobile && mobileTab === "preview";

  // ── Render ──
  return (
    <div className={styles.root}>
      <div className={styles.topStripe} />

      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <img src="img/WFFVOCES.webp" alt="WFF Perú" className={styles.logo} />
        </div>

        <div className={styles.hdrRight}>
          <button className={styles.btnLogout} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {mode === "edit" && (
        <div className={styles.mobileTabs}>
          <button
            className={mobileTab === "editor" ? styles.activeTab : ""}
            onClick={() => setMobileTab("editor")}
          >
            ✏️ Editor
          </button>
          <button
            className={mobileTab === "preview" ? styles.activeTab : ""}
            onClick={() => setMobileTab("preview")}
          >
            👁 Vista previa
          </button>
        </div>
      )}

      <div className={styles.layout}>
        {/* ── SIDEBAR DRAWER ── */}
        <div
          className={`${styles.sidebarWrap} ${sidebarOpen ? styles.sidebarOpen : ""}`}
        >
          <ArticleList
            articles={articles}
            currentId={currentId}
            onSelect={selectArticle}
            onNew={newArticle}
          />
        </div>

        {/* ── OVERLAY (cierra el drawer al tocar fuera) ── */}
        {sidebarOpen && (
          <div
            className={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── ÁREA DE TRABAJO ── */}
        <div className={styles.workArea} ref={workAreaRef}>
          {/* 🟢 MOBILE */}
          {isMobile ? (
            mobileTab === "editor" ? (
              <div ref={editorPanelRef} className={styles.editorPanel}>
                {mode === "idle" ? (
                  <EmptyState
                    icon="✍️"
                    title="Ningún artículo seleccionado"
                    sub="Selecciona uno o crea uno nuevo."
                  />
                ) : (
                  <ArticleEditor
                    article={currentArticle}
                    onSave={handleSave}
                    onDelete={handleDeleteRequest}
                    onCancel={() => setMode("idle")}
                    onTogglePreview={togglePreview}
                    previewOpen={previewOpen}
                    isMobile={isMobile}
                    onPreviewDataChange={handlePreviewDataChange}
                    mobileTab={mobileTab}
                  />
                )}
              </div>
            ) : (
              <div ref={previewPanelRef} className={styles.previewPanel}>
                <ArticlePreview
                  data={previewData}
                  onClose={() => setPreviewOpen(false)}
                  isMobile={isMobile}
                />
              </div>
            )
          ) : (
            /* 🟣 DESKTOP (tu lógica actual) */
            <>
              <div ref={editorPanelRef} className={styles.editorPanel}>
                {mode === "idle" ? (
                  <EmptyState
                    icon="✍️"
                    title="Ningún artículo seleccionado"
                    sub="Selecciona uno o crea uno nuevo."
                  />
                ) : (
                  <ArticleEditor
                    article={currentArticle}
                    onSave={handleSave}
                    onDelete={handleDeleteRequest}
                    onCancel={() => setMode("idle")}
                    onTogglePreview={togglePreview}
                    previewOpen={previewOpen}
                    isMobile={isMobile}
                    onPreviewDataChange={handlePreviewDataChange}
                    mobileTab={mobileTab}
                  />
                )}
              </div>

              {showPreviewPanel && mode === "edit" && (
                <div ref={previewPanelRef} className={styles.previewPanel}>
                  <ArticlePreview
                    data={previewData}
                    onClose={() => setPreviewOpen(false)}
                    isMobile={isMobile} // 👈 aquí
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {deleteTargetId !== null && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      <Toast
        icon={toast.icon}
        message={toast.message}
        visible={toast.visible}
      />
    </div>
  );
}
