import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
import ThemeProvider from "@/components/theme/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import JotaiProvider from "@/components/providers/JotaiProvider";
import LikesProvider from "@/components/likes/LikesProvider";
import CommentLikesProvider from "@/components/likes/CommentLikesProvider";
import { getInitialLikedIds } from "@/lib/post-likes.server";
import { getInitialLikedCommentIds } from "@/lib/comment-likes.server";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "note ――sáng tạo, kết nối, lan tỏa.",
  description:
    "Nền tảng nội dung nơi người sáng tạo có thể đăng bài viết, truyện tranh, ảnh và âm thanh, người dùng có thể thưởng thức và ủng hộ. Để ai cũng có thể vui vẻ sáng tạo và theo đuổi lâu dài, chúng tôi đề cao một môi trường an toàn và đa dạng.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const initialLikedIds = await getInitialLikedIds();
  const initialLikedCommentIds = await getInitialLikedCommentIds();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
          <App>
            <QueryProvider>
              <JotaiProvider>
                <LikesProvider initialLikedIds={initialLikedIds}>
                  <CommentLikesProvider initialLikedCommentIds={initialLikedCommentIds}>
                    <ThemeProvider>{children}</ThemeProvider>
                  </CommentLikesProvider>
                </LikesProvider>
              </JotaiProvider>
            </QueryProvider>
          </App>
        </AntdRegistry>
      </body>
    </html>
  );
}
