# Kế hoạch Nâng cấp Giao diện Website (Premium "Apple-like" Experience)

## 1. Mục tiêu (Objectives)
Biến đổi toàn bộ giao diện của dự án thành một trải nghiệm web cao cấp, hiện đại và chuyên nghiệp nhất, đạt tiêu chuẩn của các trang web giới thiệu sản phẩm của Apple. Giao diện cần thể hiện sự sang trọng, tinh tế, mượt mà trong từng chuyển động, mang lại cảm giác "WOW" cho người dùng ngay từ cái nhìn đầu tiên.

## 2. Nguyên tắc Thiết kế Cốt lõi (Core Design Principles)
- **Minimalism & Negative Space (Tối giản & Không gian âm):** Sử dụng nhiều không gian trống để làm nổi bật sản phẩm và nội dung. Không nhồi nhét thông tin.
- **Typography (Nghệ thuật chữ):** Sử dụng phông chữ không chân hiện đại (như Inter, San Francisco hoặc Roboto). Tiêu đề phải to, đậm, rõ ràng; văn bản phụ cần nhỏ gọn, độ tương phản vừa phải (thường dùng màu xám trên nền đen).
- **Glassmorphism (Hiệu ứng kính mờ):** Áp dụng hiệu ứng `backdrop-blur` cho thanh điều hướng (Navbar), các hộp thông tin nổi (Bento boxes) để tạo chiều sâu.
- **Micro-animations (Hiệu ứng chuyển động nhỏ):** Mọi tương tác (hover nút, mở menu) và cuộn trang (scroll reveal, parallax) phải cực kỳ mượt mà, không bị giật lag.
- **Bento Grid Layout:** Sử dụng bố cục dạng lưới thẻ (Bento Box) với các góc bo tròn (border-radius lớn) để hiển thị tính năng sản phẩm - xu hướng thiết kế đặc trưng của Apple hiện nay.
- **Dark Mode First (Ưu tiên giao diện tối):** Giao diện chủ đạo là màu đen sâu, xám đậm kết hợp với các dải màu gradient tinh tế (titanium, ánh kim) để làm nổi bật hình ảnh thiết bị.

## 3. Các Thành phần Cần Nâng cấp Chi tiết

### 3.1. Navigation Bar (Thanh điều hướng)
- **Thiết kế:** Dính (sticky) ở đầu trang, chiều cao nhỏ gọn, sử dụng nền kính mờ (glassmorphism) để nhìn xuyên thấu nội dung cuộn bên dưới.
- **Nội dung:** Chứa logo ở giữa hoặc trái, các liên kết chữ nhỏ tinh tế, icon giỏ hàng và tìm kiếm tối giản. Viền dưới siêu mỏng (`border-b border-white/10`).

### 3.2. Hero Section (Khu vực màn hình đầu tiên)
- **Thiết kế:** Hình ảnh hoặc video sản phẩm lấp đầy màn hình (full viewport).
- **Typography:** Tiêu đề cực lớn ở chính giữa (ví dụ: "iPhone 18 Pro. Sức mạnh vượt trội.").
- **Animation:** Chữ và hình ảnh phải từ từ hiện lên (fade in) và trượt nhẹ từ dưới lên (slide up) khi trang vừa load xong.

### 3.3. Product Showcases & Feature Highlights (Khu vực tính năng sản phẩm)
- **Scroll Animations:** Các thành phần chỉ hiện ra khi người dùng cuộn tới (Scroll-triggered animations).
- **Bento Grid:** Thay vì liệt kê text thông thường, hãy chia tính năng thành các "thẻ" (cards) bo góc tròn mượt mà (`rounded-2xl` hoặc `rounded-3xl`), nền xám đen, nội dung sắp xếp phi đối xứng nhưng cân bằng.
- **Hình ảnh:** Hình ảnh sản phẩm chất lượng cao, có thể sử dụng hiệu ứng Parallax nhẹ khi cuộn.

### 3.4. Nút bấm (Buttons) & Tương tác (Interactions)
- Nút "Mua ngay" hoặc "Tìm hiểu thêm" cần thiết kế dạng pill (bo tròn hoàn toàn - `rounded-full`).
- Tương tác hover mượt mà: Thay đổi độ sáng của nền, nút hoặc phóng to nhẹ hình ảnh bên trong thẻ.

### 3.5. Footer (Chân trang)
- Thiết kế dạng danh sách nhiều cột chuẩn mực.
- Chữ nhỏ, màu xám nhạt (`text-gray-400`), phân cấp rõ ràng, ngăn cách bằng các đường kẻ mỏng (`border-white/10`).

## 4. Hướng dẫn Từng bước cho AI (Codex) Triển khai Code
Dưới đây là các bước yêu cầu Codex thực hiện (hãy bám sát theo thứ tự này):

**Bước 1: Thiết lập Hệ thống Thiết kế (Design System & Tailwind)**
- Cập nhật `tailwind.config.ts` (hoặc `mjs`): Thêm màu sắc (màu nền đen tuyền, màu xám Apple), phông chữ (ưu tiên Inter hoặc hệ thống sans-serif), cấu hình các class animation đặc trưng.
- Cập nhật `globals.css`: Thiết lập nền đen (`bg-black text-white`), cấu hình smooth scrolling (`html { scroll-behavior: smooth; }`).

**Bước 2: Cài đặt thư viện Animation (Nên dùng Framer Motion)**
- Cài đặt `framer-motion` (nếu chưa có) để xử lý các hiệu ứng hiện thị khi cuộn, fade-in, và micro-animations cao cấp.

**Bước 3: Code Component Navigation & Footer**
- Viết lại `Navbar.jsx/tsx`: Áp dụng `fixed top-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10`.
- Viết lại `Footer.jsx/tsx` cho chuyên nghiệp, giống cấu trúc Apple Footer.

**Bước 4: Code Khu vực Hero Section**
- Xây dựng component mở đầu gây ấn tượng mạnh. Tiêu đề lớn, mượt mà fade-in, có nút kêu gọi hành động (Call to Action) bo tròn đẹp mắt.

**Bước 5: Code Khu vực Tính năng (Bento Box / Scroll Reveal)**
- Xây dựng các thẻ tính năng (chip, camera, pin...) theo dạng lưới Bento.
- Sử dụng cấu trúc `grid` của Tailwind. Mỗi thẻ có background `bg-zinc-900`, `rounded-3xl`, viền mỏng (`border border-white/5`), khi hover thì scale nhẹ.
- Thêm animation reveal khi scroll cho từng thẻ.

**Bước 6: Tối ưu & Đánh bóng (Polish & Responsive)**
- Đảm bảo trên Mobile giao diện vẫn hoàn hảo, mượt mà, không bị vỡ layout.
- Kiểm tra các lỗi lệch pixel, đảm bảo mọi thứ đều "pixel-perfect".

---
**Thông điệp cho AI (Codex):**
"Tôi muốn bạn đóng vai là một Senior Front-end Engineer với hơn 10 năm kinh nghiệm làm việc tại Apple. Hãy đọc kỹ kế hoạch này và viết/cập nhật lại toàn bộ code cho dự án. Code của bạn không chỉ cần chạy được, mà còn phải tạo ra một giao diện thực sự ĐẲNG CẤP, sang trọng, hiệu ứng vô cùng mượt mà. Đừng viết code đại khái, hãy chăm chút đến từng pixel, từng mili-giây của animation, từng hiệu ứng bóng mờ (blur) và từng font chữ."
