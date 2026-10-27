import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { EXTRA } from "../i18n/extra";

interface Props {
  url: string;
  title: string;
}

export function ArticleShare({ url, title }: Props) {
  const { language } = useLanguage();
  const text = EXTRA[language];
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { name: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
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
            className="article-share-button"
          >
            {target.name}
          </a>
        ))}

        <button type="button" className="article-share-button" onClick={() => void copy()}>
          {copied ? text.copied : text.copyLink}
        </button>

        {canNativeShare && (
          <button
            type="button"
            className="article-share-button article-share-native"
            onClick={() => void navigator.share({ title, url }).catch(() => undefined)}
          >
            {text.nativeShare}
          </button>
        )}
      </div>
    </section>
  );
}
