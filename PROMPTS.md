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

---

## 2026-08-23

### Hiển thị description ở card gợi ý và Reply inline trong Comment

**Prompt:** Ở chi tiết bài viết thì phần bài viết gợi ý không hiển thị description ở card, phần comment khi trả lời ở comment nào thì hiển thị ô input ở comment đấy và css lại cho đẹp hơn, viết prompts đã chỉnh sửa vào file promts.md

**Thực hiện:**
1. **Card gợi ý thiếu description:** Các note trong `data/lifestyle.ts` đều có `excerpt: ""` nên card trống
   - Thêm fallback: hiển thị `note.excerpt`, nếu rỗng thì lấy đoạn văn đầu tiên của `note.body`
   - Tách class `.featuredExcerpt` riêng (line-clamp 2 dòng, màu secondary)
   - Card trong grid "Bài viết liên quan" chiếm full width ô grid (`> a { width: 100% }`) mà không ảnh hưởng `.featured` ở trang chủ (horizontal scroll vẫn giữ width cố định)
2. **Reply inline:** Trước đây ô nhập reply hiển thị ở đầu danh sách bình luận
   - Chuyển form reply xuống ngay tại comment được bấm trả lời (cả comment cha lẫn comment con)
   - State `replyingTo` gồm: `targetId` (comment được bấm reply — nơi render form), `rootId` (thread cha — nơi gắn bình luận mới, giữ cấu trúc 2 cấp), `parentAuthor` (tên người được reply)
   - Khi trả lời comment con: tự động mở rộng danh sách trả lời của thread cha
3. **CSS mới:**
   - Khung reply dạng card nổi: nền phụ, viền, bo góc 12px, animation trượt xuống, focus đổi màu viền primary
   - Reply indicator "Đang trả lời @Tên" dạng pill, tên nổi bật màu primary
   - Nút "Trả lời X" dạng pill có viền, hover đổi màu primary
   - Textarea focus có ring (box-shadow) màu primary
   - Nút like/reply hover phóng nhẹ + màu primary

**Files đã sửa:**
- `FE/components/TopicCard.tsx` - Fallback description từ body
- `FE/components/TopicCard.module.scss` - Class .featuredExcerpt
- `FE/app/note/[id]/note.module.scss` - Card full width trong recommendedGrid
- `FE/components/CommentList.tsx` - Reply inline logic, auto-expand thread
- `FE/components/CommentList.module.scss` - Styles khung reply, pill button
- `FE/components/CommentForm.tsx` - Không đổi logic, chỉ style
- `FE/components/CommentForm.module.scss` - Pill indicator, focus ring, compact
- `FE/components/Comment.module.scss` - Polish nút hành động

---

### Comment mới nhất lên đầu, Avatar tròn, Fix khung Reply mất viền

**Prompt:** Bình luận mới nhất hiển thị lên đầu, avatar của user comment để border-radius: 100%, khi ấn trả lời comment thì giao diện CSS bị lỗi không hiện border

**Thực hiện:**
1. **Bình luận mới nhất lên đầu:** Đổi sắp xếp comment cha trong `getCommentsWithHierarchy` từ cũ → mới sang mới → cũ (giảm dần theo `createdAt`). Comment con (reply) vẫn giữ thứ tự cũ → mới để đúng luồng hội thoại
2. **Avatar tròn:** Cập nhật `border-radius: 100%` + `object-fit: cover` cho `.avatar` ở Comment và CommentForm
3. **Fix khung reply mất border/nền:** Nguyên nhân là các biến CSS `--color-bg-secondary`, `--color-bg-hover`, `--color-bg-primary`, `--color-bg-tertiary`, `--color-primary` được dùng trong SCSS nhưng **không hề được khai báo** trong `globals.css`, dẫn đến nền trong suốt, viền/nút submit bị mất màu
   - Bổ sung đầy đủ 5 biến còn thiếu vào cả `@theme` và `:root`
   - Xóa selector `:target` thừa trong `.replyForm`

**Files đã sửa:**
- `FE/app/globals.css` - Thêm biến CSS còn thiếu (--color-primary, --color-bg-*)
- `FE/lib/commentStorage.ts` - Sort bình luận mới nhất lên đầu
- `FE/components/Comment.module.scss` - Avatar border-radius 100%
- `FE/components/CommentForm.module.scss` - Avatar border-radius 100%
- `FE/components/CommentList.module.scss` - Dọn selector thừa

---

### Fix hiển thị sai tên khi trả lời comment

**Prompt:** Khi ấn vào trả lời comment của user thì hiển thị sai tên

**Thực hiện:**
1. **Nguyên nhân:** Khi trả lời một comment con, code cũ gắn bình luận mới vào thread cha (`rootId`) thay vì comment được bấm, nên tên hiển thị ở indicator lẫn badge "→ Tên" là tên chủ thread, không phải người vừa được trả lời
2. **Fix:**
   - Luôn lưu `parentId` = đúng id comment được bấm trả lời
   - Bỏ `rootId` khỏi state `replyingTo`, chỉ còn `{ targetId, parentAuthor }`
   - Khi render thread, gom toàn bộ descendant (con, cháu...) về hiển thị phẳng dưới comment cha gốc (`collectDescendants`), sắp xếp theo thời gian
   - Badge "→ Tên" tra đúng tác giả cha trực tiếp qua `getAuthorOf(parentId)` thay vì luôn dùng `parent.author`
   - Tự động mở rộng thread chứa comment đang được trả lời

**Files đã sửa:**
- `FE/components/CommentList.tsx` - Logic reply đúng tác giả, flatten descendants

---

### Avatar comment nhỏ lại + viền tròn

**Prompt:** Ảnh avatar user comment css width, height bé lại và css border hình tròn

**Thực hiện:**
1. Giảm kích thước avatar trong `Comment.tsx` từ 32px xuống 24px
2. Thêm viền tròn cho avatar: `border: 2px solid var(--color-border-default)`, `border-radius: 100%`, `object-fit: cover`
3. Căn lại lề khung reply theo avatar mới (34px desktop, 28px mobile)
4. Fix lỗi lint: tách hàm đệ quy `collectDescendants` ra khỏi `useCallback` thành hàm module-level (tránh lỗi "accessed before it is declared")

**Files đã sửa:**
- `FE/components/Comment.tsx` - Avatar 24px
- `FE/components/Comment.module.scss` - Viền tròn avatar
- `FE/components/CommentList.module.scss` - Căn lại margin khung reply
- `FE/components/CommentList.tsx` - Tách collectDescendants ra module-level

---

### Bỏ border, Enter gửi comment, số tym, emoji picker, phân trang 10 comment

**Prompt:** CommentForm khi trả lời thì phần trả lời ai không cần border, comment form cũng không cần border, ấn enter gửi luôn, có số lượng tym comment và cài thêm gói emoji, mặc định hiển thị 10 comment kể cả cấp cha con + nút xem thêm bình luận

**Thực hiện:**
1. **Bỏ border:** Reply indicator "Đang trả lời @Tên" và khung reply `.replyForm` bỏ hoàn toàn border (khung reply chỉ còn nền phụ bo góc)
2. **Enter để gửi:** Ấn `Enter` gửi bình luận ngay, `Shift + Enter` để xuống dòng
3. **Số tym comment:** Thay heart local state bằng reaction ❤️ thật từ `commentStorage.toggleEmojiReaction` — hiển thị trái tim đặc + số count khi được like, gọi `onDataChange` reload danh sách (đổi tên prop `onDelete` → `onDataChange`)
4. **Gói emoji:** Cài `emoji-picker-react`, thêm nút Smile ở hàng action mở picker chọn emoji chèn vào nội dung bình luận
5. **Phân trang comment:** Mặc định hiển thị tối đa 10 bình luận (tính cả cấp cha lẫn con) theo thứ tự mới nhất lên đầu; nếu còn thì hiện nút "Xem thêm bình luận (số còn lại)", mỗi lần bấm hiển thị thêm 10
6. **Fake data:** Nới từ 4 lên 14 comment (9 cha + 5 con) để demo phân trang

**Files đã sửa:**
- `FE/components/CommentForm.tsx` - Enter to send, tích hợp EmojiPicker
- `FE/components/CommentForm.module.scss` - Bỏ border indicator, style nút emoji + picker
- `FE/components/CommentList.module.scss` - Bỏ border khung reply, style nút xem thêm
- `FE/components/Comment.tsx` - Số tym từ reaction ❤️, prop onDataChange
- `FE/components/Comment.module.scss` - Style nút like + count
- `FE/components/CommentList.tsx` - Phân trang visibleThreads, fake data 14 comment
- `FE/package.json` - Thêm dependency emoji-picker-react

---

### Tách "Xem thêm" cấp cha khỏi cấp con, avatar 36px

**Prompt:** Xem thêm bình luận ở cấp cha khác với cấp con, avatar của user comment để 36px

**Thực hiện:**
1. **Tách phân trang:** Trước đây ngân sách 10 comment tính chung cả cha lẫn con (reply chiếm slot của cha)
   - Giờ "Xem thêm bình luận" chỉ áp dụng cho comment cấp cha: mặc định 10 cha, mỗi lần bấm thêm 10
   - Reply trong thread không bị cắt bởi phân trang cha — khi bấm "Trả lời X ^" hiển thị đầy đủ các reply
2. **Avatar 36px:** Tăng avatar comment từ 24px lên 36px, căn lại lề khung reply (46px desktop, 40px mobile) và reply indicator (44px)

**Files đã sửa:**
- `FE/components/CommentList.tsx` - visibleParents chỉ cắt comment cha
- `FE/components/Comment.tsx` - Avatar 36px
- `FE/components/Comment.module.scss` - .avatar 36px
- `FE/components/CommentList.module.scss` - Margin khung reply
- `FE/components/CommentForm.module.scss` - Margin reply indicator

---

### Comment 3 cấp ông-cha-cháu, tym count, emoji popover, ẩn tự-reply, focus input, fake data mới

**Prompt:** Phát triển comment có các cấp ông cha cháu (3 cấp), thêm số lượt tym cho comment, emoji khi ấn hiển thị kiểu popover, khi trả lời comment của chính mình thì không cần hiển thị "đang trả lời", phần viết bình luận ấn vào thì focus input luôn, fake nhiều data mới hơn

**Thực hiện:**
1. **3 cấp ông-cha-cháu:** Render lồng nhau: bình luận cha → con → cháu (mỗi cấp thụt lề + đường kẻ trái riêng `.nestedReplies`). Cấp sâu hơn 3 được gộp ngang hàng cấp cháu (`getGrandChildren` gộp direct children + descendants sâu hơn), badge "→ Tên" vẫn tra đúng cha trực tiếp. Trả lời ở bất kỳ cấp nào cũng mở toàn bộ chuỗi ancestor thread (`getThreadAncestorIds`)
2. **Số tym:** Fake sẵn like counts cho nhiều comment qua `seedLikes` (❤️ reaction), nút tim hiển thị số ngay từ đầu
3. **Emoji popover:** Bọc `emoji-picker-react` trong antd `Popover` trigger click trên nút Smile — picker nổi phía trên form thay vì đẩy layout
4. **Ẩn tự-reply:** Khi trả lời comment của chính mình (parentAuthor === currentUser.name) thì ẩn dòng "Đang trả lời..."
5. **Focus input:** Thêm `autoFocus` cho textarea — bấm vào placeholder "Viết bình luận" là focus gõ được luôn
6. **Fake data mới:** Thêm 9 comment mới gồm 2 chuỗi đủ 3 cấp (fake_1→2→15 và fake_5→6→16, kèm 1 comment cấp 4 để demo gộp), tổng 23 comment

**Files đã sửa:**
- `FE/components/CommentList.tsx` - Render 3 cấp, helpers, fake data + seedLikes
- `FE/components/CommentList.module.scss` - .nestedReplies
- `FE/components/CommentForm.tsx` - Popover emoji, ẩn self-reply indicator, autoFocus
- `FE/components/CommentForm.module.scss` - Dọn .emojiPickerWrap

---

### Padding các level, nút X cạnh nút gửi, popover emoji không đè input

**Prompt:** Thêm padding cho các level, css lại, nút đóng comment bằng icon X hiển thị cạnh nút gửi, thêm padding cho CommentForm, popover emoji không được đè vào phần input

**Thực hiện:**
1. **Padding các level:** Tăng thụt lề + padding dọc cho `.replies` (28px/18px) và `.nestedReplies` (26px/16px), khung reply `.replyForm` padding 12x16, mỗi comment cách nhau 14px
2. **Nút X cạnh nút gửi:** Nút đóng (CloseOutlined) giờ luôn hiển thị cạnh nút gửi ở mọi loại form (kể cả reply), viền tròn + hover scale
3. **Padding CommentForm:** Form chính 20px 0 8px, form compact trong khung reply 4px 0
4. **Popover emoji:** Đổi placement từ topRight → bottomRight để picker mở xuống dưới nút Smile, không che ô nhập comment (antd tự lật nếu hết chỗ)

**Files đã sửa:**
- `FE/components/CommentForm.tsx` - Nút X luôn hiện, placement bottomRight
- `FE/components/CommentForm.module.scss` - Padding form, style nút X
- `FE/components/CommentList.module.scss` - Padding các level
- `FE/components/Comment.module.scss` - Spacing comment

---

### Ẩn badge tự-reply, cho phép đổi tên hiển thị

**Prompt:** Khi tự trả lời comment của mình thì không cần hiển thị "Người dùng → Người dùng", phần viết comment cho người ta chỉnh sửa tên muốn comment, sau khi sửa thì các tên ở list comment cũng thay đổi theo

**Thực hiện:**
1. **Ẩn badge tự-reply:** Badge "→ Tên" trên comment con bị ẩn khi cha trực tiếp chính là user hiện tại (`getDisplayParentAuthor` so sánh author với userName), áp dụng cho cả cấp con lẫn cấp cháu
2. **Sửa tên hiển thị:** Thêm hàng "Bình luận với tên: [Tên] ✏️" ở form chính — bấm vào thành input, Enter/blur để lưu
   - Hàm `updateUser()` trong commentStorage: lưu tên mới vào `note_user` đồng thời đổi tác giả tất cả comment cũ có tên trùng → danh sách cập nhật theo ngay lập tức
   - Sau khi lưu: refresh danh sách + state userName qua callback `onProfileChange`

**Files đã sửa:**
- `FE/lib/commentStorage.ts` - Thêm updateUser()
- `FE/components/CommentForm.tsx` - Hàng sửa tên (form chính)
- `FE/components/CommentForm.module.scss` - Style nameRow/nameButton/nameInput
- `FE/components/CommentList.tsx` - Ẩn badge tự-reply, handleProfileChange

---

### Thêm khoảng cách trên đầu CommentList

**Prompt:** CommentList nên thêm paddingTop hoặc marginTop

**Thực hiện:** `.commentList` thêm `margin-top: 16px` + tăng `padding-top` từ 24px → 40px (mobile: 24px), tách bạch phần bình luận với action bar phía trên

**Files đã sửa:**
- `FE/components/CommentList.module.scss` - Spacing đầu section

---

### Trang chi tiết: content căn giữa hoàn toàn, creator card fixed trái có border + MXH

**Prompt:** Trang chi tiết thì phần nội dung luôn ở giữa, phần creatorInfo để fixed bên trái layout, thêm border và thêm các thông tin mạng xã hội Facebook, YouTube, Instagram

**Thực hiện:**
1. **Content luôn ở giữa:** Đổi `.layout` từ flex sang **grid 3 cột** `220px | 1fr | 220px` — cột trái là creator card (sticky top 100px), cột phải là rail trống đối xứng → nội dung luôn chính giữa trang bất kể chiều dài bài viết
2. **Creator card có border:** Khung bo góc 16px, viền + nền trắng, avatar viền 3px, description clamp 3 dòng
3. **Social links:** Thêm hàng icon Facebook / YouTube / Instagram (`@ant-design/icons`) mở tab mới, hover đảo màu đen-trắng + nhích lên
4. Mobile (<900px): ẩn 2 rail, content full width như cũ

**Files đã sửa:**
- `FE/app/note/[id]/page.tsx` - socialLinks, cột rail phải
- `FE/app/note/[id]/note.module.scss` - Grid layout, creatorProfile card, socialRow/socialLink

---

### Mở rộng phần nội dung trang chi tiết

**Prompt:** Phần nội dung phải chiếm rộng hơn

**Thực hiện:** Tăng `.articleInner` max-width 1100px → 1320px, thu rail 220px → 200px và gap 32 → 28 → nội dung rộng ~784px (trước ~516px) mà vẫn căn giữa hoàn toàn

**Files đã sửa:**
- `FE/app/note/[id]/note.module.scss` - articleInner, .layout

---

### Nút back ở đầu sidebar creator

**Prompt:** Thêm 1 nút back và icon để quay lại trang gần nhất ở đầu phần sidebar (trên creatorProfile), hover có hiệu ứng; creatorProfile căn giữa trong layout của nó

**Thực hiện:**
1. Tạo `components/BackButton.tsx` (client) — nút pill `ArrowLeftOutlined` + "Quay lại", gọi `router.back()` về trang gần nhất
2. Đặt nút ở đầu `.sidebar`, trên creatorProfile card
3. Sidebar chuyển `flex-direction: column` + `align-items: center` để nút và card đều căn giữa cột
4. Hover: đảo nền đen - chữ trắng, nhích sang trái 4px, đổ bóng nhẹ (transition easeInOutExpo)

**Files đã sửa:**
- `FE/components/BackButton.tsx` - Tạo mới
- `FE/app/note/[id]/page.tsx` - Import + render BackButton trong sidebar
- `FE/app/note/[id]/note.module.scss` - .backButton, sidebar column

---

### Thêm nút tym trên các CardTopic

**Prompt:** Ở các CardTopic thêm các nút tym bài viết

**Thực hiện:**
1. TopicCard chuyển thành client component — nút tim ❤️ ở hàng tác giả (bên phải), hiển thị số likes (likes gốc + 1 nếu đã tym)
2. State like lưu localStorage (`note_card_likes`) theo note id; đọc lại qua useEffect để tránh lệch hydration
3. Nút nằm trong `<Link>` nên phải `preventDefault` + `stopPropagation` để bấm tym không điều hướng
4. Hover: nền hồng nhạt + scale; đã tym: tim đặc màu #d13e5c

**Files đã sửa:**
- `FE/components/TopicCard.tsx` - Nút tym + logic localStorage
- `FE/components/TopicCard.module.scss` - .likeButton

---

### Hover TopicCard có màu nền

**Prompt:** Khi hover vào topiccard thì thêm màu background

**Thực hiện:** `.card`/`.featured` thêm padding 8px (bù margin -8px để không đổi kích thước ngoài) + border-radius 12px; hover hiện nền `--color-surface-quaternary` kèm box-shadow nhẹ. Nút tym tách riêng hàng dưới author (`.likeRow`)

**Files đã sửa:**
- `FE/components/TopicCard.tsx` - Tách likeRow dưới author, bỏ featuredExcerpt
- `FE/components/TopicCard.module.scss` - Hover nền + .likeRow

---

### Sidebar: danh mục cha-con theo dữ liệu

**Prompt:** Ở trong sidebar thì sửa lại theo dữ liệu và cấp cha con

**Thực hiện:**
1. Xóa link "Thử thách" hardcode — sidebar giờ render toàn bộ từ mảng `topics` (5 nhóm: Thử thách, Tài chính, Đời sống, Học tập, Công nghệ)
2. Mỗi topic = 1 hàng cha: tên (`Link` tới `topic.href`) + nút mũi tên xoay 90° mở/đóng
3. Con hiển thị thụt lề với đường kẻ trái khi mở (accordion, state `openTopics`)
4. Fix card đầu tiên ở TopicSectionView mất padding-left khi hover: scroller đổi `md:px-0` → `md:px-2` để chứa margin âm -8px của card; description section giới hạn `line-clamp-3`

**Files đã sửa:**
- `FE/components/Sidebar.tsx` - TopicList accordion theo data
- `FE/components/Sidebar.module.scss` - .topicGroup/.topicRow/.topicParent/.topicToggle/.childNav
- `FE/components/TopicSectionView.tsx` - px-2 scroller, line-clamp-3

---

### Sidebar: bỏ border-left, luôn mở, giới hạn 10 con + Xem thêm

**Prompt:** Không cần border-left, cấp con thẳng hàng với cha, luôn luôn mở, tối đa 10 phần tử và có nút Xem thêm khi ấn vào sẽ hiện thêm

**Thực hiện:**
1. Bỏ accordion (nút xoay + state mở/đóng) — danh mục con luôn hiển thị
2. `.childNav` bỏ border-left/padding thụt lề → cấp con thẳng hàng với cha
3. Giới hạn 10 con mỗi topic (`CHILD_LIMIT`); vượt quá thì hiện nút "Xem thêm (N)" — bấm mới hiển thị hết
4. Fake data: topic "Thử thách" có 13 children để demo nút Xem thêm; dọn import RightOutlined thừa

**Files đã sửa:**
- `FE/components/Sidebar.tsx` - TopicChildren với limit 10
- `FE/components/Sidebar.module.scss` - Bỏ border/toggle, thêm .moreButton
- `FE/data/notes.ts` - Thêm 8 children fake cho "Thử thách"

---

### Sidebar: nút đóng/mở topic, con thụt lề + border, rộng thêm 20px

**Prompt:** Thêm nút để đóng mở các topic trong sidebar, cấp con thụt lề và có border, sidebar nên cho rộng ra khoảng 20px

**Thực hiện:**
1. Trả lại nút toggle (RightOutlined xoay 90° khi mở) — mặc định các topic đang MỞ, bấm mới thu lại (state `collapsedTopics`)
2. `.childNav` thụt lề 14px + border-left 2px; child link vẫn line-clamp 2 dòng
3. Sidebar rộng từ 182px → 202px (`w-[12.625rem]`)

**Files đã sửa:**
- `FE/components/Sidebar.tsx` - Toggle + width mới
- `FE/components/Sidebar.module.scss` - .topicToggle/.childNav border

---

### Fix lỗi "No link element found for chunk ...css" + SnsBox

**Prompt:** Lỗi runtime `No link element found for chunk /_next/static/chunks/components_xxx._.css` (Next.js 16.3.1 stale, Turbopack) vẫn xuất hiện, viết vào prompts.md; SnsBox giữ border như cũ và text center, chữ không đậm, hover sidebar đậm hơn chút

**Nguyên nhân lỗi chunk CSS:** Dev server (Turbopack) bị stale sau nhiều lần thay đổi CSS module liên tục — HMR giữ tham chiếu tới chunk CSS cũ đã không tồn tại nữa.

**Cách xử lý:**
1. Xoá thư mục cache `.next`
2. **Dừng hẳn dev server (Ctrl+C) và chạy lại `npm run dev`** — bắt buộc phải restart tiến trình vì server đánh dấu "(stale)" thì xoá cache riêng lẻ chưa đủ
3. Nếu vẫn lỗi: xoá cả `.next` rồi restart lại lần nữa / thử trình duyệt hard-refresh (Ctrl+Shift+R)

**Sửa UI kèm theo:**
- `.snsBox` trả lại border box (radius 10px, padding 12px), text center, font-weight thường (bỏ đậm)
- Icon MXH: nút tròn 34px viền, hover đảo đen-trắng + nhích lên
- Toàn bộ hover trong sidebar đổi sang `--color-bg-hover` (#eceff3) đậm hơn trước

**Files đã sửa:**
- `FE/components/Sidebar.module.scss` - .snsBox/.snsIcon/.snsIcons, hover màu đậm hơn

---

### Tổ chức lại thư mục components

**Prompt:** Trong thư mục components sắp xếp lại, tạo các folder tương ứng để gộp các file cho dễ đọc

**Cấu trúc mới:**
```
components/
├── admin/           # AdminLayout, AdminSidebar, DynamicEditor, Editor, PreviewEditor, AdminSectionPlaceholder
├── comment/         # Comment, CommentForm, CommentList (+scss)
├── layout/          # AppLayout, Navbar, Sidebar, SidebarDrawer, LoginModal, NoteLogo
├── note/            # NoteActions, NoteLike, NoteTitleActions, BackButton, SocialLinks
├── topic/           # TopicCard, TopicHeader, TopicSectionView
└── ClientComponents.tsx  (dynamic imports ssr:false)
```

**Việc đã làm:**
- Di chuyển file vào folder tương ứng
- Cập nhật toàn bộ import paths trong `app/` và `components/`
- Fix lint TopicCard: thay `useState`+`useEffect` đọc localStorage bằng `useSyncExternalStore` (đúng pattern external store, tránh hydration mismatch và còn đồng bộ tym giữa nhiều card cùng bài)

**Files đã sửa:** toàn bộ file import liên quan + `components/topic/TopicCard.tsx`

---

### Nội dung chi tiết bài viết render bằng editor view + fake data giàu định dạng

**Prompt:** Trong chi tiết bài viết, phần nội dung (note.body.map → p) nên sửa lại thành component editor ở chế độ view và fake lại dữ liệu nhiều

**Thực hiện:**
1. **Render bằng editor view:** Thay map `<p>` bằng `<PreviewEditor blocks={bodyToBlocks(note)} />` (BlockNoteView `editable={false}` sẵn có trong admin/)
2. **Mở rộng dữ liệu:** Note type thêm trường tùy chọn `blocks?: Partial<Block>[]`; tạo `data/noteBlocks.ts`:
   - `bodyToBlocks()` — note có `blocks` dùng luôn, không thì chuyển từng đoạn body thành paragraph block
   - `makeRichFakeBlocks(index)` — sinh nội dung demo đa định dạng: heading 2 cấp, bullet list, numbered list, quote, ảnh (picsum) kèm caption
3. **Fake data:** `makeFakeNotes` (topicExtraNotes) gắn `blocks` rich theo index — các bài extra trong trang topic đều có bài viết dài, nhiều định dạng
4. **CSS:** `.body` neutralize chrome BlockNote (padding 0, nền trong suốt), nhịp chữ 16px/1.9 đồng bộ với trang

**Files đã sửa/tạo:**
- `FE/app/note/[id]/page.tsx` - PreviewEditor thay <p> map
- `FE/data/noteBlocks.ts` - Tạo mới
- `FE/data/notes.ts` - Note.blocks?
- `FE/data/topicExtraNotes.ts` - blocks cho fake notes
- `FE/components/admin/PreviewEditor.tsx` - Nhận Partial<Block>[]
- `FE/app/note/[id]/note.module.scss` - Override editor styles

---

### Nội dung editor thẳng hàng + responsive layout chi tiết bài viết

**Prompt:** Trong PreviewEditor muốn nội dung thẳng hàng, và NotePage responsive lại: màn hình bé thì .layout css lại để nội dung chiếm nhiều hơn; kèm fix lỗi type Partial<Block>

**Thực hiện:**
1. **Fix type:** Đổi `Partial<Block>[]` (BlockNote type quá nghiêm ngặt) sang type tự định nghĩa `NoteBlock { type, props?, content? }` — PreviewEditor nhận `Record<string, unknown>[]` rồi cast khi truyền vào editor
2. **Nội dung thẳng hàng:** Override CSS BlockNote trong `.body`: `.bn-container/.bn-editor` padding 0, mọi block margin/padding 0 + rhythm 18px đều nhau, text-align left
3. **Responsive .layout:**
   - ≥1400px: 3 cột 300px | content | 300px như cũ
   - ≤1400px: bỏ rail phải, creator card còn 240px → content rộng hơn hẳn
   - ≤1100px: dồn 1 cột, ẩn sidebar/rail → nội dung full width
4. Sửa typo `margin-Top` → `margin-top` ở .backButton

**Files đã sửa:**
- `FE/data/notes.ts` - NoteBlock type
- `FE/data/noteBlocks.ts` - Dùng NoteBlocks loose type
- `FE/components/admin/PreviewEditor.tsx` - Props Record<string, unknown>[]
- `FE/app/note/[id]/note.module.scss` - Editor align + layout responsive

---

### Fix lỗi runtime useCreateBlockNote khi SSR

**Prompt:** Lỗi runtime tại `components/admin/PreviewEditor.tsx (12:36) @ useCreateBlockNote` trong trang chi tiết bài viết

**Nguyên nhân:** Client component vẫn bị server-render — `useCreateBlockNote` của BlockNote cần window/document nên crash khi SSR. Trang admin cũ né bằng dynamic import `ssr: false`, nhưng trang note import PreviewEditor trực tiếp.

**Thực hiện:** Thêm vào `ClientComponents.tsx`:
- `PreviewEditor = dynamic(() => import("...admin/PreviewEditor"), { ssr: false })`
- Export `ClientNoteBody({ blocks })` bọc component
- Note page dùng `<ClientNoteBody blocks={bodyToBlocks(note)} />` thay cho PreviewEditor trực tiếp

**Files đã sửa:**
- `FE/components/ClientComponents.tsx` - Dynamic import ssr:false
- `FE/app/note/[id]/page.tsx` - Đổi sang ClientNoteBody

---

### Admin quản lý bài viết: thêm cột ảnh + trạng thái

**Prompt:** Trong trang quản trị, ở trang quản lý bài viết ở table nên thêm ảnh và thêm trạng thái: nháp hoặc đã đăng

**Thực hiện:**
1. `AdminPost` thêm `cover?: string` và `status?: "draft" | "published"` (type `PostStatus`) — seed 8 bài có ảnh picsum theo id + trạng thái trộn đều nháp/đã đăng
2. Table thêm 2 cột:
   - **Ảnh**: thumbnail 72×45 bo góc 8px (next/image `unoptimized`), không có cover thì fallback picsum theo id
   - **Trạng thái**: antd Tag — "Nháp" màu orange, "Đã đăng" màu green; dữ liệu cũ trong localStorage không có status sẽ mặc định hiện "Nháp"
3. Cột ID thu hẹp còn 100px cho vừa hàng

**Files đã sửa:**
- `FE/lib/adminStorage.ts` - PostStatus, seedPosts có cover/status
- `FE/app/admin/posts/page.tsx` - 2 cột mới
- `FE/app/admin/posts/posts.module.scss` - .thumb

---

### Cột ID đứng trước ảnh + tất cả table có scrollY

**Prompt:** Cột ID đứng trước cột ảnh, và tất cả các table đều có scrollY để responsive

**Thực hiện:**
1. Đổi thứ tự cột trong bảng bài viết: ID → Ảnh → Tiêu đề → Trạng thái → ...
2. Thêm scroll dọc cho 5 table admin (posts, sidebar, sidebar topic [id], tags, users) bằng `scroll={{ y: 420 }}` — lưu ý antd v6 không có prop `scrollY`, phải dùng object `scroll`

**Files đã sửa:**
- `FE/app/admin/posts/page.tsx`
- `FE/app/admin/sidebar/page.tsx`
- `FE/app/admin/sidebar/topic/[id]/page.tsx`
- `FE/app/admin/tags/page.tsx`
- `FE/app/admin/users/page.tsx`

---

### Chiều cao table tính theo màn hình

**Prompt:** Chiều cao của table tính toán theo chiều cao màn hình, tránh để scroll ngoài layout

**Thực hiện:** Đổi `scroll={{ y: 420 }}` (cố định) → `scroll={{ y: "calc(100dvh - 330px)" }}` ở cả 5 table admin. Con số 330px = navbar + padding trang + header bảng + phân trang; layout admin vốn `h-dvh` + `main overflow-y-auto` nên giờ scroll chỉ nằm trong body bảng, không cuộn ngoài khung

**Files đã sửa:** 5 file page admin như trên

---

### Quản lý sidebar: cột Mô tả + CRUD mô tả, fake data

**Prompt:** Trong quản lý sidebar thêm phần description trong bảng và crud fake thêm dữ liệu

**Thực hiện:**
1. `SidebarItem` thêm `description?: string`
2. **Fake data:** `sidebarDesc()` sinh mô tả tự động theo tên cho toàn bộ seed (5 mục gốc + 5 nhóm topic + mọi mục con)
3. **Bảng:** Thêm cột "Mô tả" (ellipsis 1 dòng, thiếu mô tả hiện "—"), search lọc được cả theo mô tả
4. **CRUD:** Form thêm/sửa có TextArea "Mô tả" (max 200 ký tự, đếm số ký tự); tạo mới/sửa đều lưu description

**Files đã sửa:**
- `FE/lib/adminStorage.ts` - SidebarItem.description + seed
- `FE/app/admin/sidebar/page.tsx` - Cột, form, filter
- `FE/app/admin/sidebar/sidebar.module.scss` - .description/.noDescription

---

### Trang tổng quan: thống kê truy cập + hồ sơ cá nhân

**Prompt:** Trang tổng quan: thống kê số lượt truy cập hàng tháng phía trên, có filter theo tháng, dùng chart; bên dưới trái là thông tin cá nhân + đổi avatar, phải là form cập nhật thông tin + thay đổi tên logo

**Thực hiện:**
1. Cài `recharts`; tạo `data/dashboard.ts` — fake lượt truy cập từng ngày của 12 tháng (deterministic bằng pseudo(), không Math.random để tránh lệch hydration)
2. Card trên: DatePicker `picker="month"` (chỉ chọn trong năm 2026 qua disabledDate) + 3 Statistic (Tổng / Ngày cao nhất / TB ngày) + AreaChart gradient
3. Tạo `lib/profileStorage.ts` — AdminProfile {name, email, role, avatar, logoName, description}, lưu localStorage + dispatch event
4. Card dưới trái: avatar lớn + nút Đổi avatar (Upload → FileReader base64, giới hạn 2MB)
5. Card dưới phải: Form Tên hiển thị / Email / Vai trò (**disabled, chỉ đọc**) / **Tên logo** + TextArea Mô tả full hàng — Lưu xong NoteLogo ở navbar tự cập nhật qua event `admin-profile-changed`
6. Fix lỗi: type form thiếu description; eslint set-state-in-effect (đưa disable comment sát dòng setProfile); toLocaleString cố định "vi-VN" toàn dự án (fix hydration); PreviewEditor bọc dynamic ssr:false (`ClientNoteBody`)

**Files đã sửa/tạo:**
- `FE/package.json` - thêm recharts
- `FE/data/dashboard.ts`, `FE/lib/profileStorage.ts` - Tạo mới
- `FE/app/admin/page.tsx` - Viết lại trang tổng quan
- `FE/components/layout/NoteLogo.tsx` - Đọc logoName động
- `FE/app/admin/admin.module.scss` - Layout dashboard
- `FE/components/ClientComponents.tsx`, `app/note/[id]/page.tsx` - ClientNoteBody
- `FE/components/note/NoteLike.tsx`, `NoteActions.tsx`, `components/comment/CommentList.tsx`, `app/topic/[slug]/page.tsx` - locale vi-VN

---

### Quản lý sidebar: căn thẳng chữ cột Tên

**Prompt:** Trong quản lý sidebar, các chữ trong cột Tên phải thẳng hàng nhau; tất cả đều phải cập nhật vào prompts.md

**Thực hiện:**
1. Table thêm `indentSize={0}` để antd không thụt dòng con theo cấp
2. Cả `.itemName` và `.childName` thống nhất font-size 15px, dùng class chung `.nameAligned` (inline-block); `.childName` margin-left 25px đúng bằng bề rộng nút expand của dòng cha → chữ cha/con bắt đầu cùng một vị trí dọc

**Files đã sửa:**
- `FE/app/admin/sidebar/page.tsx` - indentSize={0}, nameAligned
- `FE/app/admin/sidebar/sidebar.module.scss` - .nameAligned, .childName margin

---

### Fix mục con vẫn lệch: dùng spacer cố định

**Prompt:** `${childName} ${nameAligned}` hiện tại cứ bị thò thụt, muốn thẳng hàng với nhau — chỉnh sửa tiếp

**Nguyên nhân:** Margin-left trên span không đáng tin vì antd tự chèn indent span/nút expand khác nhau giữa các dòng.

**Thực hiện:** Đổi sang spacer cố định trong render cột Tên:
- Mọi ô tên bọc `.nameCell` (inline-flex)
- Dòng con chèn `.childSpacer` rộng 44px (flex-shrink 0) trước chữ → mọi mục con bắt đầu chữ tại cùng một vị trí tuyệt đối, thụt lề so với mục cha, không phụ thuộc icon/indent của antd
- Bỏ class nameAligned/margin cũ

**Files đã sửa:**
- `FE/app/admin/sidebar/page.tsx` - Render nameCell + childSpacer
- `FE/app/admin/sidebar/sidebar.module.scss` - .nameCell/.childSpacer

---

### childSpacer đổi sang div full-width, xuống dòng, căn trái

**Prompt:** .childSpacer nên để thẻ div để chiếm đủ chiều rộng và xuống dòng, tất cả các .childSpacer căn trái và không được thò thụt, thẳng hàng nhau

**Thực hiện:**
1. `.nameCell` đổi span → div (display block) — tránh nest div trong span sai HTML
2. `.childSpacer` thành div block width 100%, height tự co về 0 → đẩy tên mục con xuống dòng riêng
3. `.childName` display block — mọi mục con căn trái tuyệt đối tại lề ô, giống hệt nhau, không thò thụt

**Files đã sửa:**
- `FE/app/admin/sidebar/page.tsx` - div thay span
- `FE/app/admin/sidebar/sidebar.module.scss` - Block layout cho nameCell/childSpacer/childName

---

### childName margin 46px + nút Tạo bài viết check token

**Prompt:** .childName sửa margin-left 46px, font 15px; nút Tạo bài viết check token — có token thì sang trang tạo bài viết, không thì mở popup đăng nhập

**Thực hiện:**
1. `.childName` thêm `margin-left: 46px`, font-size 15px (giữ display block)
2. Navbar: bỏ Link bọc ngoài, nút "Tạo bài viết" onClick kiểm tra `hasAuth()` — có token → `router.push("/admin/create")`, không → `setLoginOpen(true)` mở LoginModal

**Files đã sửa:**
- `FE/app/admin/sidebar/sidebar.module.scss` - .childName
- `FE/components/layout/Navbar.tsx` - Nút tạo bài viết có check auth

---

### Menu button chỉ hiện mobile + Drawer dùng đúng Sidebar

**Prompt:** Responsive — ở màn điện thoại mới hiển thị nút menu (MenuOutlined mở Drawer), và khi mở sidebar trong Drawer thì nội dung ứng với các sidebar ở desktop

**Thực hiện:**
1. **Nút menu ẩn trên desktop:** Thêm class `.menuButton` với media query ≥1024px `display:none !important` (desktop đã có sidebar cố định)
2. **Sidebar tái sử dụng được:** Thêm props `variant` ("desktop" | "drawer" — drawer bỏ hidden/border/width cố định) và `onNavigate` (truyền xuống mọi Link: Trang chủ, topic cha, mục con để bấm xong tự đóng Drawer)
3. **SidebarDrawer:** Bỏ list link hardcode cũ, render `<Sidebar variant="drawer" onNavigate={onClose} />` → mobile có cùng cấu trúc cha-con/mô tả như desktop

**Files đã sửa:**
- `FE/components/layout/Sidebar.tsx` - Props variant/onNavigate
- `FE/components/layout/SidebarDrawer.tsx` - Render Sidebar
- `FE/components/layout/Navbar.tsx` - menuButton ẩn desktop
- `FE/components/layout/Navbar.module.scss` - .menuButton

---

### Căn chỉnh lại mức thụt lùi của mục con trong quản lý sidebar

**Prompt:** Các text ở mục con phải thẳng hàng nhau và thụt lùi vào so với mục cha

**Thực hiện:** `.childName` tăng margin-left lên 50px — các mục con bắt đầu chữ tại cùng một vị trí (thẳng hàng nhau) và thụt lùi sâu hơn dòng mục cha (~25px)

**Files đã sửa:**
- `FE/app/admin/sidebar/sidebar.module.scss` - margin .childName

---

### Đậm hover card, title topic có mũi tên, trang chi tiết topic + fake data

**Prompt:** Màu hover topiccard đậm hơn chút; trong TopicSection phần title thêm icon right arrow, hover vào title có màu background, ấn vào thì sang màn chi tiết topic — fake thêm data

**Thực hiện:**
1. **Hover card đậm hơn:** Đổi nền hover từ `--color-surface-quaternary` (#f5f8fa) → `--color-bg-hover` (#eceff3)
2. **Title section:** Thành `<Link>` tới `/topic/[slug]` kèm icon RightOutlined trong vòng tròn; hover: nền pill `--color-bg-hover` + mũi tên trượt phải (easeInOutExpo)
3. **Trang chi tiết topic** `app/topic/[slug]/page.tsx`: header dùng lại `TopicHeader`, số lượng bài viết, nút về trang chủ, từng section hiển thị grid 3 cột (2/1 responsive) các `TopicCard`
4. **Fake data:** Hàm `makeFakeNotes` sinh 4 bài mẫu/section (ảnh picsum theo seed, tác giả luân phiên, likes/comments/bookmarks deterministic) → mỗi section có bài gốc + bài fake
5. Slug không khớp → `notFound()`

**Files đã sửa/tạo:**
- `FE/components/TopicCard.module.scss` - Hover đậm hơn
- `FE/components/TopicSectionView.tsx` - Title link + arrow icon
- `FE/components/TopicSectionView.module.scss` - Tạo mới (.titleLink/.titleArrow)
- `FE/app/topic/[slug]/page.tsx` - Tạo mới trang chi tiết topic
- `FE/app/topic/[slug]/topic.module.scss` - Styles trang topic

---

### Chỉnh titleLink + chi tiết topic theo section, card featured=false

**Prompt:** Sửa .titleLink (padding 2px 14px, radius 6px, hover underline + màu primary); ấn vào title topic VD "Du lịch" thì trang chi tiết chỉ hiển thị title + description của section đó và các topiccard liên quan với featured = false

**Thực hiện:**
1. `.titleLink` đổi theo mẫu: padding 2px 14px, border-radius 6px, hover gạch chân + màu primary (bỏ nền pill), mũi tên vẫn trượt phải
2. Link title thêm query `?s=<section.id>` để trỏ đúng section
3. Trang chi tiết: đọc `searchParams.s` — nếu có thì chỉ render section đó (title + description riêng) và `featured={false}` (card nhỏ); không có ?s → tất cả section như cũ (card lớn)

**Files đã sửa:**
- `FE/components/TopicSectionView.module.scss` - .titleLink mới
- `FE/components/TopicSectionView.tsx` - href có ?s=sectionId
- `FE/app/topic/[slug]/page.tsx` - Đọc searchParams, lọc section, featured=false
- `FE/app/topic/[slug]/topic.module.scss` - .sectionDesc
