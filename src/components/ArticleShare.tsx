import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { EXTRA } from "../i18n/extra";

interface Props {
  url: string;
  title: string;
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="share-x-logo">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function ArticleShare({ url, title }: Props) {
  const { language } = useLanguage();
  const text = EXTRA[language];
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      name: "WhatsApp",
      className: "share-whatsapp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <i className="fab fa-whatsapp" aria-hidden="true" />,
    },
    {
      name: "LinkedIn",
      className: "share-linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <i className="fab fa-linkedin-in" aria-hidden="true" />,
    },
    {
      name: "Facebook",
      className: "share-facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <i className="fab fa-facebook-f" aria-hidden="true" />,
    },
    {
      name: "X",
      className: "share-x",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XLogo />,
    },
  ];

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="article-share" aria-label={text.share}>
      <h2>{text.share}</h2>

      <div className="article-share-buttons">
        {targets.map((target) => (
          <a
            key={target.name}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`article-share-icon ${target.className}`}
            aria-label={target.name}
            title={target.name}
          >
            {target.icon}
          </a>
        ))}

        <button
          type="button"
          className="article-share-icon share-copy"
          onClick={() => void copy()}
          aria-label={text.copyLink}
          title={text.copyLink}
        >
          <i className={copied ? "fas fa-check" : "fas fa-link"} aria-hidden="true" />
        </button>

        {canNativeShare && (
          <button
            type="button"
            className="article-share-icon share-native"
            onClick={() => void navigator.share({ title, url }).catch(() => undefined)}
            aria-label={text.nativeShare}
            title={text.nativeShare}
          >
            <i className="fas fa-share-alt" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="article-share-feedback" role="status" aria-live="polite">
        {copied ? text.copied : ""}
      </p>
    </section>
  );
}
