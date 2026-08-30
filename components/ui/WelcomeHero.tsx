import type { ReactNode } from "react";

export default function WelcomeHero() {
  return (
    <div style={root}>
      <div style={iconWrap}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      <h1 style={title}>Chào mừng bạn đến với Note</h1>
      <p style={subtitle}>
        Nơi chia sẻ kiến thức, trải nghiệm và những dòng suy nghĩ mỗi ngày.
        <br />
        Hãy bắt đầu khám phá nhé!
      </p>
    </div>
  );
}

function Badge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span style={badge}>
      <span style={badgeIcon}>{icon}</span>
      {label}
    </span>
  );
}



const root: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 24px",
  textAlign: "center",
};

const iconWrap: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "var(--color-surface-quaternary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 32,
};

const title: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: "0 0 12px",
};

const subtitle: React.CSSProperties = {
  fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
  color: "var(--color-text-secondary)",
  lineHeight: 1.7,
  margin: "0 0 36px",
};

const badges: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  justifyContent: "center",
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 18px",
  borderRadius: 9999,
  background: "var(--color-surface-quaternary)",
  color: "var(--color-text-secondary)",
  fontSize: 14,
  fontWeight: 500,
};

const badgeIcon: React.CSSProperties = {
  display: "inline-flex",
  color: "var(--color-text-tertiary)",
};
