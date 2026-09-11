# Tool-Project-manage

## Mục đích dự án

Xây dựng một công cụ Project Management Assistant chạy local để hỗ trợ Project Manager quản lý dự án.

## Các tính năng dự kiến

- Tổng quan dự án
- Báo cáo ngày
- Báo cáo tuần
- Biên bản họp
- Theo dõi task
- Risk Log - danh sách rủi ro
- Issue Log - danh sách vấn đề
- Action Items - danh sách việc cần xử lý
- Project Status Report - báo cáo trạng thái dự án
- Quản lý tài liệu dự án

## Nguyên tắc làm việc

- Giữ hệ thống đơn giản, dễ hiểu và chia module rõ ràng.
- Mỗi lần chỉ phát triển một tính năng.
- Không thiết kế quá phức tạp khi chưa cần thiết.
- Không sử dụng dữ liệu thật của công ty hoặc khách hàng.
- Không commit file `.env`, API key, password, token hoặc thông tin nhạy cảm.
- Chỉ sử dụng dữ liệu demo hoặc dữ liệu giả để phát triển.
- Trước khi thay đổi kiến trúc lớn, phải giải thích ngắn gọn phương án trước.
- Khi thêm tính năng mới, phải hạn chế ảnh hưởng đến tính năng hiện tại.
- Ưu tiên UI/UX đơn giản, dễ sử dụng cho Project Manager.
- Mỗi session phát triển chỉ tập trung vào một nhiệm vụ.

## Quy trình phát triển

1. Đọc và hiểu yêu cầu.
2. Kiểm tra source code hiện tại.
3. Đề xuất phương án ngắn gọn.
4. Chỉ implement đúng nhiệm vụ được yêu cầu.
5. Chạy kiểm tra hoặc test cơ bản.
6. Tóm tắt những file và nội dung đã thay đổi.
7. Không tự động chuyển sang phát triển tính năng tiếp theo.

## Quy tắc Git

- Không tự động push lên remote.
- Không tự động commit nếu chưa được yêu cầu.
- Sau khi hoàn thành, phải liệt kê các file đã thay đổi.
- Không được thay đổi hoặc xóa code không liên quan đến nhiệm vụ hiện tại.

## Ràng buộc hiện tại

- Không tạo thêm bất kỳ file nào khác.
- Chưa khởi tạo framework.
- Chưa cài package.
- Chưa tạo UI.
- Chỉ tạo file `AGENTS.md` trong nhiệm vụ này.
