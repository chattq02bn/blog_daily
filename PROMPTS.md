# Prompts

## 2026-08-22

### Thêm Comment và Gợi ý vào trang Chi tiết Note

**Prompt:** Trong phần chi tiết note thì thêm phần comment và gợi ý, và sau mỗi lần viết prompts thì thêm vào file promts.md

**Thực hiện:**
1. Thêm component `CommentList` vào trang chi tiết note (`app/note/[id]/page.tsx`)
2. Tạo hàm `getRelatedNotes` để tìm các note liên quan dựa trên tag
3. Hiển thị section "Bài viết liên quan" với các note có chung tag
4. Tạo file `prompts.md` để lưu trữ prompts

**Files đã sửa:**
- `FE/app/note/[id]/page.tsx` - Thêm CommentList và Related Notes

---

### Căn chỉnh nội dung, Comment và Gợi ý cùng Layout

**Prompt:** Phần nội dung và comment, gợi ý thì phải thẳng hàng nhau, chung 1 layout

**Thực hiện:**
- Di chuyển `commentSection` và `recommendedSection` vào trong div `.content`
- Tất cả các phần теперь nằm trong cùng 1 container có `max-width: 800px` và `margin: 0 auto`

**Files đã sửa:**
- `FE/app/note/[id]/page.tsx` - Căn chỉnh layout

---

### Mở rộng nội dung và thêm Sidebar Sticky

**Prompt:** Cho phần nội dung rộng ra 1 tý, và phần bên trái thì để sticky thông tin người đăng

**Thực hiện:**
- Tăng max-width lên 1100px
- Tạo layout 2 cột: sidebar trái (200px) và content phải
- Sidebar có `position: sticky` để giữ thông tin tác giả luôn hiển thị khi scroll
- Ẩn sidebar trên mobile (< 900px)
- Di chuyển creatorProfile từ content sang sidebar

**Files đã sửa:**
- `FE/app/note/[id]/page.tsx` - Cấu trúc layout mới
- `FE/app/note/[id]/note.module.scss` - Styles cho layout 2 cột

---

### Fix Sticky Sidebar

**Prompt:** Sticky sidebar không đứng yên khi scroll

**Thực hiện:**
- Đặt `position: sticky` trực tiếp lên `.sidebar` thay vì `.sidebarSticky`
- Thêm `align-self: flex-start` để sidebar không bị kéo giãn
- Bỏ div wrapper `.sidebarSticky` không cần thiết

**Files đã sửa:**
- `FE/app/note/[id]/note.module.scss` - Fix sticky
- `FE/app/note/[id]/page.tsx` - Bỏ div wrapper

---

### Căn chỉnh nội dung giữa và Card gợi ý như Home

**Prompt:** Phần nội dung thì vẫn ở giữa, còn phần thông tin user thì được sticky bên trái, và phần gợi ý thì lấy card giống với trang home

**Thực hiện:**
- Giới hạn content max-width: 700px, margin: 0 auto để nội dung luôn ở giữa
- Sidebar sticky bên trái (200px)
- Thay thế grid layout bằng horizontal scroll cho section gợi ý
- Sử dụng component `TopicCard` từ trang home cho các note liên quan

**Files đã sửa:**
- `FE/app/note/[id]/note.module.scss` - Layout centered content, horizontal scroll
- `FE/app/note/[id]/page.tsx` - Sử dụng TopicCard

---

### Fix lỗi createContext SSR

**Prompt:** Lỗi `(0 , _react.createContext) is not a function`

**Thực hiện:**
- Sử dụng `dynamic` import từ `next/dynamic` với `ssr: false` cho CommentList và TopicCard
- Tránh lỗi React context khi render server-side với antd

**Files đã sửa:**
- `FE/app/note/[id]/page.tsx` - Dynamic import

---

### Fix lỗi ssr: false trong Server Components

**Prompt:** `ssr: false` is not allowed with `next/dynamic` in Server Components

**Thực hiện:**
- Tạo file `ClientComponents.tsx` với `"use client"` directive
- Di chuyển dynamic import vào Client Component
- Export `ClientCommentList` và `ClientTopicCard` để sử dụng trong Server Component

**Files đã sửa:**
- `FE/components/ClientComponents.tsx` - Tạo mới
- `FE/app/note/[id]/page.tsx` - Sử dụng Client Components

---

### Hoàn thiện phần chi tiết Note

**Prompt:** Sửa lại phần chi tiết note giống prompts

**Thực hiện:**
- Cập nhật page.tsx sử dụng `ClientCommentList` và `ClientTopicCard` từ `ClientComponents.tsx`
- Đảm bảo layout đúng: sidebar sticky trái (200px), content centered (700px), horizontal scroll cho related notes

**Files đã sửa:**
- `FE/app/note/[id]/page.tsx` - Sử dụng Client Components

---

### Bài viết liên quan 2 card to

**Prompt:** Bài viết liên quan thì để 2 card to

**Thực hiện:**
- Giảm số lượng related notes từ 3 xuống 2
- Sử dụng `featured={true}` cho TopicCard để hiển thị card to
- Thay thế horizontal scroll bằng grid 2 cột
- Responsive: 1 cột trên mobile (< 640px)

**Files đã sửa:**
- `FE/app/note/[id]/page.tsx` - featured={true}, count=2
- `FE/app/note/[id]/note.module.scss` - recommendedGrid 2 cột

---

### Nội dung full width

**Prompt:** Đã có 2 card to nhưng nội dung cũng phải chiếm full ra

**Thực hiện:**
- Bỏ `max-width: 700px` và `margin: 0 auto` khỏi `.content`
- Nội dung giờ chiếm toàn bộ phần còn lại của layout

**Files đã sửa:**
- `FE/app/note/[id]/note.module.scss` - Bỏ max-width content

---

### Card chiếm hết nội dung

**Prompt:** Trong Bài viết liên quan thì nội dung và ảnh, ko chiếm hết phần trong card

**Thực hiện:**
- Đổi `.featured` từ `width: 16rem/22rem` cố định sang `width: 100%`
- Card giờ chiếm toàn bộ width của grid cell

**Files đã sửa:**
- `FE/components/TopicCard.module.scss` - width: 100%

---

### Revert CSS TopicCard

**Prompt:** Revert lại css

**Thực hiện:**
- Hoàn原CSS của TopicCard như cũ

**Files đã sửa:**
- `FE/components/TopicCard.module.scss` - Revert

---

### Ẩn sidebar trang tạo mới

**Prompt:** Ở phần tạo mới bài viết thì bỏ sidebar đi

**Thực hiện:**
- Thêm prop `hideSidebar` vào AppLayout

**Files đã sửa:**
- `FE/app/admin/create/page.tsx` - hideSidebar

---

### Thiết kế lại phần Comment

**Prompt:** Phần comment ở chi tiết bài viết thì nên làm như hình mẫu

**Thực hiện:**
- Đơn giản hóa CommentList header: "Bình luận X" không có icon
- CommentForm: Hiển thị avatar + placeholder text, click để mở textarea
- Comment: Thay emoji bar bằng heart icon và reply icon
- Replies: Hiển thị đường kẻ đứng bên trái, nút "Trả lời X ^"
- Responsive: ẩn more button trên desktop, hiển thị trên mobile

**Files đã sửa:**
- `FE/components/CommentList.tsx` - Đơn giản hóa header và replies
- `FE/components/CommentList.module.scss` - Styles mới
- `FE/components/CommentForm.tsx` - Design dạng placeholder
- `FE/components/CommentForm.module.scss` - Styles mới
- `FE/components/Comment.tsx` - Heart và reply icons
- `FE/components/Comment.module.scss` - Styles mới

---

### Fix Comment Form và Thêm Fake Data

**Prompt:** 
- Nút send không thấy ở comment
- CSS lại list đã comment
- Ấn trả lời bình luận thì bị mất ô input nhập comment
- Ảnh avatar bị lỗi
- Không có icon gửi đi
- Muốn chỉ trả lời theo cấp cha con
- Khi ấn icon để trả lời 1 comment thì hiển thị tên người muốn trả lời
- Fake data cho comment

**Thực hiện:**
- Thêm SendOutlined icon vào nút submit (hình tròn màu primary)
- Fix avatar bằng `unoptimized` để tránh lỗi Next.js Image
- Luôn hiển thị form reply khi ấn trả lời, có indicator tên người được reply
- Thêm reply indicator hiển thị "Đang trả lời @Tên"
- Fake data 4 comments với avatar từ pravatar.cc
- Fix CSS compact và responsive

**Files đã sửa:**
- `FE/components/CommentForm.tsx` - Send icon, reply indicator
- `FE/components/CommentForm.module.scss` - Styles send button, reply indicator
- `FE/components/Comment.tsx` - Avatar unoptimized, reply name
- `FE/components/Comment.module.scss` - Compact styles
- `FE/components/CommentList.tsx` - Fake data, reply form logic
- `FE/components/CommentList.module.scss` - Reply form styles
