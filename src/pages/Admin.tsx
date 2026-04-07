import { useState, useRef, useCallback, useEffect } from "react";
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

export default function Admin() {
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

  const { onMouseDown: onResizerMouseDown } = useResizer({
    containerRef: workAreaRef,
    editorRef: editorPanelRef,
    previewRef: previewPanelRef,
    enabled: previewOpen && !isMobile,
  });

  // 🔥 CARGAR DESDE LA BD
  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

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

  useEffect(() => {
    if (previewOpen || isMobile) return;
    const ep = editorPanelRef.current;
    if (ep) {
      ep.style.flex = "1";
      ep.style.width = "";
    }
  }, [previewOpen, isMobile]);

  const currentArticle = articles.find((a) => a.id === currentId) ?? null;

  const selectArticle = useCallback(
    (id: number) => {
      const art = articles.find((a) => a.id === id);
      setCurrentId(id);
      setMode("edit");
      setSidebarOpen(false);
      setMobileTab("editor");
      setPreviewData(art ? { ...art } : null);
    },
    [articles]
  );

  const newArticle = useCallback(() => {
    setCurrentId(null);
    setMode("edit");
    setSidebarOpen(false);
    setMobileTab("editor");
    setPreviewData(null);
  }, []);

  // 🔥 GUARDAR (POST / PUT)
  const handleSave = useCallback(
    async (data: Omit<Article, "id">) => {
      try {
        if (currentId) {
          const res = await fetch(`/api/articles/${currentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          const updated = await res.json();

          setArticles((prev) =>
            prev.map((a) => (a.id === currentId ? updated : a))
          );

          showToast("✅", "Artículo actualizado.");
        } else {
          const res = await fetch("/api/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          const created = await res.json();

          setArticles((prev) => [...prev, created]);
          setCurrentId(created.id);

          showToast("🚀", "Artículo publicado.");
        }
      } catch (err) {
        console.error(err);
        showToast("❌", "Error al guardar.");
      }
    },
    [currentId, showToast]
  );

  const handleCancel = useCallback(() => {
    setMode("idle");
    setCurrentId(null);
    setPreviewOpen(false);
    setPreviewData(null);
  }, []);

  const handleDeleteRequest = useCallback(() => {
    if (currentId !== null) setDeleteTargetId(currentId);
  }, [currentId]);

  // 🔥 ELIMINAR
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTargetId === null) return;

    try {
      await fetch(`/api/articles/${deleteTargetId}`, {
        method: "DELETE",
      });

      setArticles((prev) =>
        prev.filter((a) => a.id !== deleteTargetId)
      );

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
  }, [deleteTargetId, showToast]);

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

  const showPreviewPanel =
    (previewOpen && !isMobile) || (isMobile && mobileTab === "preview");

  return (
    <div className={styles.root}>
      <div className={styles.topStripe} />

      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <button
            className={`${styles.menuBtn} ${sidebarOpen ? styles.menuOpen : ""}`}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className={styles.logoCircle}>🌾</div>
          <div>
            <p className={styles.logoTitle}>Foro Mundial de la Alimentación</p>
            <p className={styles.logoSub}>Capítulo Perú · Admin</p>
          </div>
        </div>
        <div className={styles.hdrRight}>
          <span className={styles.liveDot}>En línea</span>
          <span className={styles.adminPill}>Admin</span>
        </div>
      </header>

      {mode === "edit" && (
        <div className={styles.mobileTabs}>
          <button
            className={`${styles.mobileTab} ${mobileTab === "editor" ? styles.activeTab : ""}`}
            onClick={() => setMobileTab("editor")}
          >
            ✏️ Editor
          </button>
          <button
            className={`${styles.mobileTab} ${mobileTab === "preview" ? styles.activeTab : ""}`}
            onClick={() => setMobileTab("preview")}
          >
            👁 Vista previa
          </button>
        </div>
      )}

      <div className={styles.layout}>
        {sidebarOpen && (
          <div
            className={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`${styles.sidebarWrap} ${sidebarOpen ? styles.sidebarVisible : ""}`}>
          <ArticleList
            articles={articles}
            currentId={currentId}
            onSelect={selectArticle}
            onNew={newArticle}
          />
        </div>

        <div className={styles.workArea} ref={workAreaRef}>
          <div
            ref={editorPanelRef}
            className={styles.editorPanel}
            style={{
              display: isMobile && mobileTab === "preview" ? "none" : undefined,
            }}
          >
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
                onCancel={handleCancel}
                onTogglePreview={togglePreview}
                previewOpen={previewOpen}
                isMobile={isMobile}
                onPreviewDataChange={handlePreviewDataChange}
              />
            )}
          </div>

          {previewOpen && !isMobile && mode === "edit" && (
            <div className={styles.resizer} onMouseDown={onResizerMouseDown} />
          )}

          {showPreviewPanel && mode === "edit" && (
            <div
              ref={previewPanelRef}
              className={styles.previewPanel}
              style={isMobile ? { width: "100%" } : undefined}
            >
              <ArticlePreview
                data={previewData}
                onClose={
                  isMobile
                    ? () => setMobileTab("editor")
                    : () => setPreviewOpen(false)
                }
              />
            </div>
          )}
        </div>
      </div>

      {deleteTargetId !== null && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      <Toast icon={toast.icon} message={toast.message} visible={toast.visible} />
    </div>
  );
}