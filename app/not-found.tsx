import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

export default function NotFound() {
  return (
    <AppLayout>
      <div style={root}>
        <div style={illustration}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="var(--color-surface-quaternary)" />
            <circle cx="88" cy="88" r="36" stroke="var(--color-text-tertiary)" strokeWidth="4" fill="none" />
            <line x1="114" y1="114" x2="148" y2="148" stroke="var(--color-text-tertiary)" strokeWidth="6" strokeLinecap="round" />
            <text x="88" y="98" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="40" fontWeight="700" fontFamily="var(--font-display)">?</text>
            <circle cx="40" cy="50" r="4" fill="var(--color-text-tertiary)" opacity="0.3" />
            <circle cx="160" cy="60" r="3" fill="var(--color-text-tertiary)" opacity="0.25" />
            <circle cx="50" cy="150" r="3.5" fill="var(--color-text-tertiary)" opacity="0.2" />
            <circle cx="155" cy="145" r="4.5" fill="var(--color-text-tertiary)" opacity="0.25" />
          </svg>
        </div>

        <h1 style={code}>404</h1>
        <p style={title}>Trang không tồn tại</p>

        <Link href="/" style={btn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Về trang chủ
        </Link>
      </div>
    </AppLayout>
  );
}

const root: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "0 24px",
  textAlign: "center",
  overflow: "hidden",
};

const illustration: React.CSSProperties = {
  marginBottom: 24,
  opacity: 0.85,
};

const code: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(3rem, 8vw, 5rem)",
  fontWeight: 800,
  color: "var(--color-text-primary)",
  margin: 0,
  lineHeight: 1,
  letterSpacing: "-0.03em",
};

const title: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
  fontWeight: 600,
  color: "var(--color-text-primary)",
  margin: "12px 0 32px",
};

const btn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 28px",
  borderRadius: 9999,
  background: "var(--color-surface-primary)",
  color: "var(--color-text-invert)",
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
  transition: "background 0.2s",
};
