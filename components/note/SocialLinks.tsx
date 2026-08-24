"use client";

import { FacebookOutlined, YoutubeOutlined, InstagramOutlined } from "@ant-design/icons";
import styles from "@/app/note/[id]/note.module.scss";

const socialLinks = [
  { key: "facebook", label: "Facebook", href: "https://facebook.com", icon: FacebookOutlined },
  { key: "youtube", label: "YouTube", href: "https://youtube.com", icon: YoutubeOutlined },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://instagram.com",
    icon: InstagramOutlined,
  },
];

export default function SocialLinks() {
  return (
    <div className={styles.socialRow}>
      {socialLinks.map(({ key, label, href, icon: Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
          aria-label={label}
          title={label}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
