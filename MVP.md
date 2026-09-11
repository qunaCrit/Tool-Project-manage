# MVP - Tool Project Manage

## 1. Người dùng mục tiêu

Người dùng chính là **Project Manager (PM - Quản lý dự án)** đang quản lý một hoặc nhiều dự án và cần một công cụ chạy local để tập trung thông tin, theo dõi công việc và chuẩn bị báo cáo.

MVP ưu tiên PM làm việc độc lập. Thành viên dự án và stakeholder (bên liên quan) chỉ nhận thông tin do PM xuất hoặc chia sẻ, chưa trực tiếp sử dụng hệ thống.

## 2. Vấn đề cần giải quyết

- Thông tin dự án nằm rải rác trong ghi chú, bảng tính và tin nhắn.
- PM khó nhìn nhanh tình trạng hiện tại của từng dự án.
- Task (công việc), Action Item (việc cần xử lý), Risk (rủi ro) và Issue (vấn đề) dễ bị bỏ sót hoặc quá hạn.
- Kết luận và việc cần làm sau cuộc họp không được theo dõi nhất quán.
- Báo cáo tuần mất thời gian tổng hợp lại từ nhiều nguồn.
- PM phải nhập lại cùng một thông tin ở nhiều nơi.

## 3. Phạm vi MVP

MVP gồm sáu nhóm chức năng bắt buộc:

1. **Quản lý Project (dự án)**: tạo, cập nhật, chọn và lưu trữ thông tin cơ bản của nhiều dự án.
2. **Project Overview (tổng quan dự án)**: hiển thị tình trạng dự án và các mục cần chú ý từ dữ liệu đã có.
3. **Task & Action Item (công việc và việc cần xử lý)**: quản lý chung trong một module để tránh trùng lặp; Action Item có thể phát sinh từ cuộc họp.
4. **Risk Log (danh sách rủi ro)** và **Issue Log (danh sách vấn đề)**: ghi nhận, phân công và theo dõi cách xử lý.
5. **Meeting Minutes (biên bản họp)**: lưu nội dung tóm tắt, quyết định và tạo Action Item sau họp.
6. **Weekly Status Report (báo cáo trạng thái tuần)**: tổng hợp tiến độ, công việc, rủi ro, vấn đề và kế hoạch tuần tới từ dữ liệu dự án.

Không làm Daily Report (báo cáo ngày) trong MVP vì làm tăng tần suất nhập liệu nhưng chưa tạo thêm nhiều giá trị so với cập nhật Task/Action Item. Không tạo một module Project Status Report riêng; Weekly Status Report là định dạng báo cáo trạng thái duy nhất trong phiên bản đầu.

## 4. Input và Output

### 4.1. Quản lý Project

**Input**

- Tên và mô tả ngắn của dự án.
- Mục tiêu, PM phụ trách, ngày bắt đầu và ngày kết thúc dự kiến.
- Trạng thái: Chưa bắt đầu, Đang thực hiện, Tạm dừng hoặc Hoàn thành.

**Process**

- Kiểm tra các trường bắt buộc.
- Lưu và cập nhật thông tin theo từng dự án.

**Output**

- Danh sách dự án.
- Hồ sơ thông tin cơ bản của từng dự án.

### 4.2. Project Overview

**Input**

- Dự án PM chọn.
- Dữ liệu đã có về task, action item, risk và issue.
- Ghi chú tình trạng tổng quát do PM cập nhật.

**Process**

- Tổng hợp số lượng theo trạng thái và hạn xử lý.
- Làm nổi bật mục quá hạn, risk mức cao và issue chưa đóng.

**Output**

- Tóm tắt tình trạng dự án.
- Công việc sắp đến hạn hoặc quá hạn.
- Risk và issue cần chú ý.
- Cập nhật gần đây.

### 4.3. Task & Action Item

**Input**

- Tiêu đề, mô tả và loại mục: Task hoặc Action Item.
- Owner (người phụ trách), deadline (hạn hoàn thành), mức ưu tiên.
- Trạng thái: Chưa làm, Đang làm, Hoàn thành hoặc Bị chặn.
- Nguồn phát sinh, nếu có, ví dụ từ cuộc họp.

**Process**

- Lưu mục công việc theo dự án.
- Cho phép cập nhật trạng thái, lọc theo owner, deadline và trạng thái.
- Xác định mục quá hạn dựa trên deadline và trạng thái.

**Output**

- Danh sách Task/Action Item có thể lọc.
- Danh sách mục sắp đến hạn, quá hạn hoặc bị chặn.
- Tiến độ công việc dùng cho Overview và báo cáo tuần.

### 4.4. Risk Log

**Input**

- Mô tả rủi ro, xác suất và mức ảnh hưởng.
- Owner, phương án giảm thiểu và ngày cần xem xét.
- Trạng thái: Mở, Đang theo dõi hoặc Đã đóng.

**Process**

- Xác định mức độ ưu tiên từ xác suất và ảnh hưởng theo quy tắc đơn giản.
- Theo dõi trạng thái và phương án giảm thiểu.

**Output**

- Risk Log theo từng dự án.
- Danh sách rủi ro mức cao hoặc cần xem xét.

### 4.5. Issue Log

**Input**

- Mô tả vấn đề, mức ảnh hưởng và ngày phát hiện.
- Owner, hướng xử lý, deadline và trạng thái.

**Process**

- Lưu và theo dõi issue đến khi đóng.
- Xác định issue quá hạn hoặc chưa có owner.

**Output**

- Issue Log theo từng dự án.
- Danh sách issue đang mở, quá hạn hoặc cần phân công.

### 4.6. Meeting Minutes

**Input**

- Tiêu đề, ngày họp và người tham gia.
- Nội dung hoặc ghi chú cuộc họp.
- Các quyết định và Action Item được PM xác nhận.

**Process**

- Lưu biên bản theo dự án.
- Tách nội dung thành Summary (tóm tắt), Decision (quyết định) và Action Item theo cấu trúc do PM nhập.
- Tạo Action Item vào danh sách công việc khi PM xác nhận.

**Output**

- Biên bản họp có cấu trúc.
- Danh sách quyết định.
- Action Item gồm owner, deadline và trạng thái.

### 4.7. Weekly Status Report

**Input**

- Dự án và khoảng thời gian báo cáo.
- Dữ liệu task/action item, risk, issue và meeting đã lưu.
- Thành tựu, kế hoạch tuần tới và ghi chú tổng quan do PM bổ sung.
- Trạng thái tổng thể do PM chọn: Xanh, Vàng hoặc Đỏ.

**Process**

- Tổng hợp dữ liệu liên quan trong tuần thành mẫu thống nhất.
- Cho phép PM rà soát và chỉnh sửa trước khi hoàn tất.

**Output**

- Báo cáo tuần gồm trạng thái tổng thể, thành tựu, công việc đang thực hiện, kế hoạch tiếp theo, risk, issue và mục cần hỗ trợ.
- Nội dung có thể sao chép để PM chia sẻ bên ngoài tool.

## 5. User Flow chính

Mở Tool → Xem danh sách và chọn Project hoặc tạo Project mới → Xem Project Overview → Cập nhật Task/Action Item, Risk hoặc Issue → Ghi Meeting Minutes và xác nhận Action Item sau họp → Quay lại Overview để kiểm tra mục cần chú ý → Cuối tuần tạo Weekly Status Report từ dữ liệu đã cập nhật → PM rà soát, chỉnh sửa và sao chép nội dung để chia sẻ.

## 6. Danh sách màn hình MVP

### 6.1. Danh sách Project

- **Mục đích:** chọn hoặc quản lý dự án.
- **Thông tin chính:** tên, trạng thái, PM, ngày kết thúc dự kiến.
- **Action chính:** tạo, chọn, sửa hoặc đánh dấu hoàn thành dự án.

### 6.2. Project Overview

- **Mục đích:** giúp PM nắm nhanh tình trạng một dự án.
- **Thông tin chính:** trạng thái tổng quát, tiến độ công việc, mục quá hạn, risk cao, issue đang mở và cập nhật gần đây.
- **Action chính:** mở chi tiết module, cập nhật ghi chú tình trạng, bắt đầu tạo báo cáo tuần.

### 6.3. Work Items

- **Mục đích:** quản lý Task và Action Item tại một nơi.
- **Thông tin chính:** loại, tiêu đề, owner, deadline, ưu tiên và trạng thái.
- **Action chính:** thêm, sửa, lọc và cập nhật trạng thái.

### 6.4. Risk & Issue

- **Mục đích:** theo dõi các rủi ro và vấn đề cần xử lý.
- **Thông tin chính:** loại, mô tả, mức độ, owner, phương án xử lý, deadline và trạng thái.
- **Action chính:** thêm, sửa, lọc, cập nhật và đóng mục.

### 6.5. Meetings

- **Mục đích:** lưu biên bản và theo dõi kết quả cuộc họp.
- **Thông tin chính:** lịch sử họp, summary, decision và action item.
- **Action chính:** tạo/sửa biên bản và chuyển action item đã xác nhận sang Work Items.

### 6.6. Weekly Reports

- **Mục đích:** tạo và lưu báo cáo trạng thái tuần.
- **Thông tin chính:** trạng thái tổng thể, thành tựu, công việc, kế hoạch, risk, issue và hỗ trợ cần thiết.
- **Action chính:** tạo bản nháp từ dữ liệu dự án, chỉnh sửa, hoàn tất và sao chép báo cáo.

## 7. Dữ liệu cần quản lý

- **Project:** thông tin và trạng thái dự án.
- **Work Item:** Task hoặc Action Item cùng owner, deadline và trạng thái.
- **Risk:** rủi ro, mức độ và phương án giảm thiểu.
- **Issue:** vấn đề, mức ảnh hưởng và hướng xử lý.
- **Meeting:** thông tin cuộc họp và biên bản.
- **Decision:** quyết định được ghi nhận trong cuộc họp.
- **Weekly Report:** nội dung báo cáo và kỳ báo cáo.

Đây chỉ là các khái niệm nghiệp vụ; MVP chưa xác định cấu trúc database.

## 8. Ngoài phạm vi MVP

- Daily Report riêng.
- Project Status Report riêng ngoài báo cáo tuần.
- AI tự động tóm tắt, phân tích hoặc dự đoán.
- Tích hợp Jira, Slack, Microsoft Teams, email hoặc lịch.
- Tích hợp Google Drive hay hệ thống quản lý tài liệu.
- Import/export file nâng cao; MVP chỉ cần sao chép nội dung báo cáo.
- Quản lý tài liệu và phiên bản tài liệu.
- Multi-user (nhiều người dùng), phân quyền và quy trình phê duyệt.
- Authentication (đăng nhập/xác thực).
- Cloud sync (đồng bộ đám mây), ứng dụng mobile và thông báo tự động.
- Quản lý ngân sách, nguồn lực hoặc lịch trình nâng cao.
- Dashboard phân tích và tùy biến báo cáo phức tạp.

## 9. Tiêu chí MVP hoàn thành

MVP được coi là usable (có thể sử dụng) khi PM có thể:

- Tạo và chuyển đổi giữa ít nhất hai dự án độc lập.
- Xem Overview phản ánh đúng dữ liệu của dự án được chọn.
- Tạo, sửa, lọc và cập nhật trạng thái Task/Action Item.
- Ghi nhận và theo dõi Risk, Issue đến khi đóng.
- Lưu Meeting Minutes và tạo Action Item từ biên bản mà không nhập lại toàn bộ thông tin.
- Tạo một Weekly Status Report từ dữ liệu đã lưu, chỉnh sửa và sao chép để chia sẻ.
- Đóng rồi mở lại tool mà dữ liệu local vẫn còn nguyên.
- Thực hiện các luồng chính bằng dữ liệu demo mà không gặp lỗi làm mất dữ liệu hoặc chặn thao tác.

## 10. Thứ tự phát triển

1. **Project Management:** tạo nền tảng chọn và quản lý nhiều dự án.
2. **Task & Action Item:** kiểm chứng luồng nhập, cập nhật và theo dõi công việc cốt lõi.
3. **Risk Log và Issue Log:** bổ sung các mục PM cần kiểm soát thường xuyên.
4. **Project Overview:** tổng hợp dữ liệu từ ba module đã ổn định.
5. **Meeting Minutes:** lưu biên bản và liên kết Action Item với Work Items.
6. **Weekly Status Report:** tổng hợp dữ liệu từ toàn bộ module, cho phép PM rà soát và sao chép.

Mỗi module cần hoàn thành luồng cơ bản và kiểm tra với dữ liệu demo trước khi chuyển sang module tiếp theo.
