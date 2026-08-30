"use client";

import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { useActiveSocialLinks } from "@/hooks/use-api";
import styles from "@/app/note/[id]/note.module.scss";

const iconMap: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  youtube: FaYoutube,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  facebook: FaFacebookF,
  x: FaXTwitter,
};

const labelMap: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X (Twitter)",
};

const colorMap: Record<string, string> = {
  youtube: "#FF0000",
  instagram: "#E4405F",
  tiktok: "#000000",
  facebook: "#1877F2",
  x: "#000000",
};

export default function SocialLinks() {
  const { data: links = [] } = useActiveSocialLinks();

  if (links.length === 0) return null;

  return (
    <div className={styles.socialRow}>
      {links.map((link) => {
        const Icon = iconMap[link.platform];
        if (!Icon) return null;
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label={labelMap[link.platform] ?? link.platform}
            title={labelMap[link.platform] ?? link.platform}
            style={{ "--sns-color": colorMap[link.platform] } as React.CSSProperties}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
