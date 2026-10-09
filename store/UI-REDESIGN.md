# Giao diện theo plan.md

Ngày kiểm tra: 09/10/2026. Bản production cục bộ: http://localhost:3000.

## Thay đổi

- Ưu tiên giao diện tối; giữ lựa chọn sáng/tối đã lưu. Dùng font hệ thống, màu trung tính và nút xanh dạng pill.
- Navbar kính mờ cố định, tìm kiếm, liên kết danh mục, menu mobile có quản lý focus và đóng bằng Escape.
- Hero chữ lớn ở giữa, ảnh mặt trước/mặt sau và ảnh camera được render từ mô hình GLB có sẵn của dự án; xuất WebP khoảng 42 KB và 51 KB.
- Bento bất đối xứng cho camera, hiệu năng, pin và tư vấn; hiệu ứng xuất hiện một lần khi cuộn. Nội dung không thêm thông số sản phẩm chưa được xác minh.
- Danh mục với tìm kiếm tên, lọc dòng máy, trạng thái rỗng và xóa lọc; thẻ sản phẩm và footer nhiều cột được thiết kế lại. Giá, biến thể, dữ liệu liên hệ, URL và luồng cửa sổ sản phẩm được giữ.
- Liên hệ Zalo/điện thoại gọn hơn. Thay phần hiển thị giá/badge bằng module riêng để thẻ sản phẩm không kéo mã database vào trình duyệt.
- Tải tính năng animation bằng LazyMotion sau lần hiển thị đầu tiên. Tắt tải trước cho các liên kết vị trí trên trang chủ để tránh tải dữ liệu trùng lặp.
- Chế độ 360° chỉ tải khi người dùng chọn. Có ảnh thay thế khi WebGL không khả dụng, điều khiển bằng phím mũi tên, giới hạn DPR và dọn tài nguyên khi đóng.

## Quyết định triển khai

- Áp dụng trực tiếp vào Next.js 16 / Tailwind 4 hiện có; token dùng CSS `@theme`, không thêm một cấu hình Tailwind cũ.
- Dùng font hệ thống theo lựa chọn được cho phép trong kế hoạch để giảm tải ban đầu.
- Chữ hero fade/slide; ảnh sản phẩm giữ hiển thị trong lúc trượt vào để tránh chờ hiệu ứng trước khi thấy sản phẩm.
- Dùng mô hình/ảnh có sẵn làm hình minh họa; không tự thay dữ liệu hàng hóa hay nội dung quản trị.
- Không thêm Lenis, hiệu ứng hạt hoặc thư viện 3D mới. Smooth scroll dùng CSS; giảm chuyển động được tôn trọng.

## Kết quả kiểm tra

| Gate | Kết quả và phạm vi |
| --- | --- |
| Design | Đã xem ảnh chụp desktop/mobile, sáng/tối, hero, Bento, danh mục, footer và cửa sổ sản phẩm. Không tràn ngang tại 320/375/640/768/1024/1440 px. |
| Motion | Kiểm tra hiệu ứng cuộn khi bật chuyển động và khi `prefers-reduced-motion: reduce`; không lỗi JavaScript. Carousel dừng ngoài vùng nhìn, khi hover/focus và khi giảm chuyển động. |
| 3D | Kiểm tra GPU NVIDIA GTX 1660 SUPER qua ANGLE Direct3D11: mở/đóng nhiều lần, xoay bằng bàn phím, tư thế tĩnh khi giảm chuyển động. Browser RAF được lấy mẫu ở 60 Hz; đây không phải phép đo toàn diện thời gian render GPU hay bộ nhớ. |
| Accessibility | Axe WCAG 2 A/AA và 2.1 AA: 0 lỗi trong desktop tối, desktop sáng và mobile tối. Đã thử focus, Escape, menu mobile và điều hướng bàn phím. Không thay thế đánh giá WCAG thủ công đầy đủ. |
| Security | Rà phần UI sửa đổi: React escape nội dung, liên kết ngoài có `noopener noreferrer`, không thêm endpoint hoặc thao tác ghi dữ liệu. CSP và `nosniff` được xác nhận ở runtime. |
| SEO | Metadata, JSON-LD, sitemap, robots và URL hiện có được giữ; Lighthouse SEO 100. |
| Testing | `npm run build` thành công (78 trang tĩnh), `npm run lint` qua, `git diff --check` qua, test CSV hiện có và kiểm tra hồi quy giá/badge qua. Browser kiểm tra tìm kiếm, lọc, reset, gallery, modal desktop/mobile, lưu theme, form bắt buộc và điều hướng qua. |
| Performance | Lighthouse 13.5, production localhost, mobile mô phỏng: Performance **95**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP **0,9 s**, LCP **2,9 s**, TBT **20 ms**, CLS **0**; tổng transfer khoảng **302 KB**. LCP chưa đạt mục tiêu dưới 2,5 s, vì vậy gate hiệu năng chưa được coi là đạt đầy đủ. |

## Giới hạn và phần cần kiểm tiếp

- Chưa đo Core Web Vitals từ người dùng thật hoặc INP thực tế; TBT không thay thế INP. Cần kiểm lại LCP trên môi trường triển khai với cache/CDN và thiết bị thật trước phát hành.
- Mobile được kiểm bằng Chromium với viewport mô phỏng; chưa kiểm trên điện thoại vật lý hoặc Safari.
- Không gửi form tư vấn, không sửa dữ liệu live và không chạy toàn bộ luồng admin có xác thực trong đợt đổi giao diện này.
- Chưa deploy hoặc kiểm URL preview Vercel; bản bàn giao là mã và production preview cục bộ.
- Công cụ Context7 và codebase-memory không có trong phiên này. API được đối chiếu với tài liệu Next.js cài trong dự án và tài liệu chính thức của Motion, gồm [LazyMotion](https://motion.dev/docs/react-lazy-motion).

## Vấn đề có sẵn giữ nguyên

- Inventory đang có tên `iPhone 18 Pro Maxxx` và slug `iphone-18-pro-maxxx`. Không tự đổi vì có thể ảnh hưởng dữ liệu và URL sản phẩm.
- Khi chạy các test Node trực tiếp có cảnh báo package chưa khai báo kiểu module; test vẫn qua. Không đổi kiểu module của cả dự án chỉ để xử lý cảnh báo này.

Ảnh chụp, báo cáo axe, browser và Lighthouse lưu tại `.qa/` trên máy này; thư mục được git-ignore.
