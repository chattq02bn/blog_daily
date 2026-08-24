import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import "./globals.css";

export const metadata: Metadata = {
  title: "note ――sáng tạo, kết nối, lan tỏa.",
  description:
    "Nền tảng nội dung nơi người sáng tạo có thể đăng bài viết, truyện tranh, ảnh và âm thanh, người dùng có thể thưởng thức và ủng hộ. Để ai cũng có thể vui vẻ sáng tạo và theo đuổi lâu dài, chúng tôi đề cao một môi trường an toàn và đa dạng.",
};

const theme = {
  token: {
    colorPrimary: "#08131A",
    colorText: "#08131A",
    colorTextSecondary: "#08131AA8",
    colorBorder: "#08131A24",
    colorBgBase: "#FFFFFF",
    colorLink: "#08131A",
    borderRadius: 8,
    fontFamily: '"Be Vietnam Pro", "Segoe UI", Arial, Roboto, sans-serif',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout applies to all pages */}
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>{children}</ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
