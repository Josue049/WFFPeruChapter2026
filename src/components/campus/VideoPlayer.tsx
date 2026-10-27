import { useCallback, useEffect, useRef, useState } from "react";
import { useCampus } from "../../campus/CampusContext";
import { campusFileUrl } from "../../campus/files";
import styles from "../../pages/campus/Campus.module.css";
import { ProgressBar } from "./ProgressBar";

interface HeartbeatResponse {
  credited: boolean;
  watched_percent: number;
  completed: boolean;
  newly_completed: boolean;
}

interface Props {
  lessonId: number;
  src: string;
  resumePosition: number;
  initialPercent: number;
  threshold: number;
  completed: boolean;
  onCompleted: () => void;
}

const BEAT_MS = 5000;
const MAX_RATE = 2;

/**
 * Reproductor con seguimiento. El navegador solo ENVÍA señales (posición y si
 * estaba reproduciendo); el servidor decide cuánto tiempo acreditar y cuándo
 * se completa la lección. Adelantar el video no suma progreso.
 */
export function VideoPlayer({ lessonId, src, resumePosition, initialPercent, threshold, completed, onCompleted }: Props) {
  const { request } = useCampus();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [percent, setPercent] = useState(initialPercent);
  const [done, setDone] = useState(completed);
  const [notice, setNotice] = useState("");
  const doneRef = useRef(completed);
  const busyRef = useRef(false);

  const beat = useCallback(
    async (playing: boolean) => {
      const video = videoRef.current;
      if (!video || busyRef.current || doneRef.current || !Number.isFinite(video.duration)) return;
      busyRef.current = true;
      try {
        const data = await request<HeartbeatResponse>(`/campus/lessons/${lessonId}/heartbeat`, {
          method: "POST",
          body: JSON.stringify({ position: video.currentTime, playing }),
        });
        setPercent(data.watched_percent);
        if (data.completed && !doneRef.current) {
          doneRef.current = true;
          setDone(true);
          onCompleted();
        }
        setNotice("");
      } catch {
        setNotice("No se pudo guardar tu progreso. Revisa tu conexión.");
      } finally {
        busyRef.current = false;
      }
    },
    [lessonId, onCompleted, request],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      if (resumePosition > 2 && resumePosition < video.duration - 3) video.currentTime = resumePosition;
    };
    const onRate = () => {
      if (video.playbackRate > MAX_RATE) video.playbackRate = MAX_RATE;
    };
    // En pausa o al terminar se cierra el tramo reproducido.
    const onPause = () => void beat(true);
    const onEnded = () => void beat(true);
    const onHidden = () => {
      if (document.hidden && !video.paused) void beat(true);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("ratechange", onRate);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onHidden);
    const timer = window.setInterval(() => {
      if (!video.paused && !video.ended) void beat(true);
    }, BEAT_MS);

    return () => {
      window.clearInterval(timer);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("ratechange", onRate);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [beat, resumePosition]);

  return (
    <div className={styles.player}>
      <video
        ref={videoRef}
        src={campusFileUrl(src)}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        playsInline
        preload="metadata"
        onContextMenu={(event) => event.preventDefault()}
      />
      <div className={styles.playerMeta}>
        <span>{done ? "✔ Lección completada" : `Debes ver al menos el ${threshold}% sin saltar tramos`}</span>
        <ProgressBar value={percent} label="Porcentaje visto" />
        <strong>{percent}%</strong>
      </div>
      {notice && <div className={styles.error} style={{ margin: 12 }}>{notice}</div>}
    </div>
  );
}
