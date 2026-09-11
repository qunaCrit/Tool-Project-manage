# DATA MODEL - Tool-Project-manage MVP

## 1. Danh sách Entity chính

Data model MVP nên giữ đơn giản, tập trung vào dữ liệu PM cần nhập, theo dõi và tổng hợp báo cáo.

Entity đề xuất:

- **Project**: dự án, là entity gốc cho toàn bộ dữ liệu.
- **WorkItem**: mục công việc, gộp Task và Action Item bằng field `type`.
- **Meeting**: cuộc họp và biên bản họp.
- **Risk**: rủi ro có thể xảy ra trong tương lai.
- **Issue**: vấn đề đã xảy ra và cần xử lý.
- **WeeklyReport**: báo cáo tuần đã được PM rà soát và lưu lại.

Entity chưa tách riêng trong MVP:

- **MeetingParticipant**: chưa cần entity riêng; lưu danh sách người tham gia dạng text/list trong `Meeting` là đủ cho single-user local tool.
- **Decision**: chưa cần entity riêng; lưu danh sách quyết định dạng text/list trong `Meeting` để giảm số bảng và luồng nhập liệu.
- **ActionItem**: không tách riêng; dùng `WorkItem` với `type = ACTION_ITEM`.

## 2. Project

Project lưu thông tin nền của từng dự án và là điểm liên kết cho các module khác.

| Field | Ý nghĩa | Bắt buộc | Kiểu dữ liệu logic |
| --- | --- | --- | --- |
| id | Định danh duy nhất của dự án | Có | ID |
| name | Tên dự án | Có | Text ngắn |
| description | Mô tả ngắn về dự án | Không | Text dài |
| status | Trạng thái hiện tại của dự án | Có | ProjectStatus |
| startDate | Ngày bắt đầu dự kiến hoặc thực tế | Không | Date |
| endDate | Ngày kết thúc dự kiến | Không | Date |
| owner | PM hoặc người phụ trách chính | Không | Text ngắn |
| customer | Khách hàng hoặc stakeholder chính | Không | Text ngắn |
| objective | Mục tiêu chính của dự án | Không | Text dài |
| healthNote | Ghi chú tình trạng tổng quát do PM cập nhật | Không | Text dài |
| createdAt | Thời điểm tạo dự án | Có | DateTime |
| updatedAt | Thời điểm cập nhật gần nhất | Có | DateTime |

## 3. Task / Action Item

Nên chọn phương án **B. Gộp Task và Action Item thành một entity `WorkItem` với field `type`**.

Lý do:

- MVP đã xác định Task và Action Item được quản lý chung trong một module.
- Hai loại này có nhiều field giống nhau: tiêu đề, owner, deadline, trạng thái, ưu tiên.
- Action Item chỉ khác ở nguồn phát sinh, thường đến từ Meeting.
- Gộp giúp Overview, lọc quá hạn và Weekly Report đơn giản hơn.

| Field | Ý nghĩa | Bắt buộc | Kiểu dữ liệu logic |
| --- | --- | --- | --- |
| id | Định danh duy nhất của mục công việc | Có | ID |
| projectId | Dự án chứa mục công việc | Có | ID tham chiếu Project |
| meetingId | Cuộc họp phát sinh Action Item, nếu có | Không | ID tham chiếu Meeting |
| type | Loại mục: Task hoặc Action Item | Có | WorkItemType |
| title | Tiêu đề ngắn của công việc | Có | Text ngắn |
| description | Mô tả chi tiết | Không | Text dài |
| status | Trạng thái xử lý | Có | WorkItemStatus |
| priority | Mức ưu tiên | Có | Priority |
| owner | Người phụ trách | Không | Text ngắn |
| dueDate | Hạn hoàn thành | Không | Date |
| source | Nguồn phát sinh, ví dụ meeting, PM note, stakeholder request | Không | Text ngắn |
| completedAt | Thời điểm hoàn thành, dùng cho báo cáo tuần | Không | DateTime |
| createdAt | Thời điểm tạo | Có | DateTime |
| updatedAt | Thời điểm cập nhật gần nhất | Có | DateTime |

## 4. Meeting

Meeting lưu dữ liệu cần cho Meeting Minutes (biên bản họp) và là nguồn tạo Action Item.

| Field | Ý nghĩa | Bắt buộc | Kiểu dữ liệu logic |
| --- | --- | --- | --- |
| id | Định danh duy nhất của cuộc họp | Có | ID |
| projectId | Dự án liên quan | Có | ID tham chiếu Project |
| title | Tiêu đề cuộc họp | Có | Text ngắn |
| meetingDate | Ngày và giờ họp | Có | DateTime |
| participants | Danh sách người tham gia | Không | Text list |
| agenda | Nội dung dự kiến trao đổi | Không | Text dài |
| notes | Ghi chú thô hoặc nội dung chính | Không | Text dài |
| summary | Tóm tắt sau họp | Không | Text dài |
| decisions | Danh sách quyết định | Không | Text list |
| createdAt | Thời điểm tạo biên bản | Có | DateTime |
| updatedAt | Thời điểm cập nhật gần nhất | Có | DateTime |

**Participants** nên lưu dạng text/list trong MVP vì tool là single-user, chưa có User, Role hay quản lý danh bạ người tham gia.

**Decisions** nên lưu dạng text/list trong MVP vì quyết định chủ yếu phục vụ đọc lại biên bản và tổng hợp Weekly Report. Khi sau này cần owner, trạng thái hoặc lịch sử phê duyệt cho từng decision thì mới tách entity riêng.

Action Item phát sinh từ Meeting sẽ được lưu trong `WorkItem` với:

- `type = ACTION_ITEM`
- `meetingId` trỏ về Meeting nguồn
- `source` ghi chú nguồn phát sinh nếu cần

## 5. Risk

Risk Log lưu các rủi ro có thể xảy ra trong tương lai.

| Field | Ý nghĩa | Bắt buộc | Kiểu dữ liệu logic |
| --- | --- | --- | --- |
| id | Định danh duy nhất của rủi ro | Có | ID |
| projectId | Dự án liên quan | Có | ID tham chiếu Project |
| title | Tiêu đề rủi ro | Có | Text ngắn |
| description | Mô tả rủi ro | Không | Text dài |
| probability | Khả năng xảy ra | Có | RiskLevel |
| impact | Mức ảnh hưởng nếu xảy ra | Có | RiskLevel |
| severity | Mức nghiêm trọng tổng hợp | Có | RiskSeverity |
| mitigation | Phương án giảm thiểu | Không | Text dài |
| owner | Người theo dõi hoặc xử lý | Không | Text ngắn |
| status | Trạng thái rủi ro | Có | RiskStatus |
| dueDate | Ngày cần xem xét hoặc xử lý tiếp | Không | Date |
| createdAt | Thời điểm tạo | Có | DateTime |
| updatedAt | Thời điểm cập nhật gần nhất | Có | DateTime |

`severity` có thể xác định bằng quy tắc đơn giản từ `probability` và `impact`:

- HIGH nếu probability hoặc impact cao và yếu tố còn lại từ trung bình trở lên.
- MEDIUM nếu cả hai ở mức trung bình hoặc một yếu tố cao nhưng yếu tố còn lại thấp.
- LOW nếu cả probability và impact thấp.

MVP có thể cho PM chọn thủ công `severity` hoặc tự gợi ý theo quy tắc trên, nhưng vẫn nên lưu `severity` để Overview và Weekly Report lọc nhanh.

## 6. Issue

Issue Log lưu các vấn đề đã xảy ra, đang ảnh hưởng tới dự án hoặc cần xử lý.

| Field | Ý nghĩa | Bắt buộc | Kiểu dữ liệu logic |
| --- | --- | --- | --- |
| id | Định danh duy nhất của issue | Có | ID |
| projectId | Dự án liên quan | Có | ID tham chiếu Project |
| title | Tiêu đề vấn đề | Có | Text ngắn |
| description | Mô tả vấn đề | Không | Text dài |
| priority | Mức ưu tiên xử lý | Có | Priority |
| impact | Tác động tới tiến độ, phạm vi, chất lượng hoặc stakeholder | Không | Text dài |
| owner | Người phụ trách xử lý | Không | Text ngắn |
| status | Trạng thái xử lý | Có | IssueStatus |
| resolution | Kết quả hoặc hướng xử lý cuối cùng | Không | Text dài |
| dueDate | Hạn xử lý | Không | Date |
| detectedAt | Ngày phát hiện vấn đề | Không | Date |
| resolvedAt | Ngày giải quyết xong | Không | Date |
| createdAt | Thời điểm tạo | Có | DateTime |
| updatedAt | Thời điểm cập nhật gần nhất | Có | DateTime |

Phân biệt:

- **Risk** = sự kiện có thể xảy ra trong tương lai.
- **Issue** = vấn đề đã xảy ra và cần theo dõi đến khi được giải quyết.

## 7. Weekly Report

Nên chọn phương án **C. Kết hợp snapshot và dữ liệu hiện tại**.

Luồng phù hợp MVP:

1. Tool tổng hợp dữ liệu hiện tại để tạo draft.
2. PM rà soát, chỉnh sửa summary, kế hoạch, ghi chú và trạng thái tổng thể.
3. Tool lưu lại bản report như một snapshot.

Lý do:

- Báo cáo tuần là tài liệu PM có thể chia sẻ ra ngoài, nên cần giữ nội dung đúng tại thời điểm phát hành.
- Nếu luôn generate lại từ dữ liệu hiện tại, báo cáo cũ có thể thay đổi khi task/risk/issue được cập nhật sau đó.
- Vẫn giữ khả năng tạo draft nhanh từ dữ liệu sống của dự án.

| Field | Ý nghĩa | Bắt buộc | Kiểu dữ liệu logic |
| --- | --- | --- | --- |
| id | Định danh duy nhất của báo cáo | Có | ID |
| projectId | Dự án được báo cáo | Có | ID tham chiếu Project |
| weekStart | Ngày bắt đầu tuần báo cáo | Có | Date |
| weekEnd | Ngày kết thúc tuần báo cáo | Có | Date |
| overallStatus | Trạng thái tổng thể: xanh, vàng, đỏ | Có | ReportStatus |
| summary | Tóm tắt tình hình tuần | Không | Text dài |
| completedWork | Công việc đã hoàn thành trong tuần | Không | Text dài |
| ongoingWork | Công việc đang thực hiện | Không | Text dài |
| upcomingWork | Kế hoạch tuần tới | Không | Text dài |
| risks | Snapshot các rủi ro đáng chú ý | Không | Text dài |
| issues | Snapshot các vấn đề đáng chú ý | Không | Text dài |
| decisions | Snapshot các quyết định trong tuần | Không | Text dài |
| notes | Ghi chú thêm hoặc hỗ trợ cần thiết | Không | Text dài |
| createdAt | Thời điểm tạo báo cáo | Có | DateTime |
| updatedAt | Thời điểm cập nhật gần nhất | Có | DateTime |

## 8. Quan hệ giữa các Entity

```text
Project
├── WorkItem
├── Meeting
├── Risk
├── Issue
└── WeeklyReport

Meeting
└── WorkItem (Action Item phát sinh từ cuộc họp)
```

Quan hệ chính:

- 1 Project có nhiều WorkItem.
- 1 Project có nhiều Meeting.
- 1 Project có nhiều Risk.
- 1 Project có nhiều Issue.
- 1 Project có nhiều WeeklyReport.
- 1 Meeting có thể tạo nhiều WorkItem loại `ACTION_ITEM`.
- 1 WorkItem có thể liên kết với 1 Meeting qua `meetingId`, nhưng không bắt buộc.
- 1 WeeklyReport luôn thuộc về 1 Project.

## 9. Enum / Status

Enum tối thiểu cho MVP:

### ProjectStatus

- `PLANNING`: Chưa bắt đầu hoặc đang chuẩn bị.
- `ACTIVE`: Đang thực hiện.
- `ON_HOLD`: Tạm dừng.
- `COMPLETED`: Hoàn thành.

### WorkItemType

- `TASK`: Công việc thông thường.
- `ACTION_ITEM`: Việc cần xử lý, thường phát sinh từ cuộc họp hoặc trao đổi.

### WorkItemStatus

- `TODO`: Chưa làm.
- `IN_PROGRESS`: Đang làm.
- `DONE`: Hoàn thành.
- `BLOCKED`: Bị chặn.

### Priority

- `LOW`: Thấp.
- `MEDIUM`: Trung bình.
- `HIGH`: Cao.
- `CRITICAL`: Rất cao, cần xử lý khẩn.

### RiskLevel

- `LOW`: Thấp.
- `MEDIUM`: Trung bình.
- `HIGH`: Cao.

### RiskSeverity

- `LOW`: Rủi ro thấp.
- `MEDIUM`: Rủi ro cần theo dõi.
- `HIGH`: Rủi ro cần chú ý cao.

### RiskStatus

- `OPEN`: Đang mở.
- `MONITORING`: Đang theo dõi.
- `MITIGATED`: Đã có biện pháp giảm thiểu.
- `CLOSED`: Đã đóng.

### IssueStatus

- `OPEN`: Đang mở.
- `IN_PROGRESS`: Đang xử lý.
- `RESOLVED`: Đã xử lý xong về mặt nghiệp vụ.
- `CLOSED`: Đã đóng.

### ReportStatus

- `GREEN`: Dự án ổn.
- `YELLOW`: Có điểm cần chú ý.
- `RED`: Có vấn đề nghiêm trọng hoặc cần hỗ trợ.

## 10. Field dùng cho Audit

Field audit dùng chung cho các entity chính:

| Field | Ý nghĩa | Bắt buộc | Kiểu dữ liệu logic |
| --- | --- | --- | --- |
| createdAt | Thời điểm bản ghi được tạo | Có | DateTime |
| updatedAt | Thời điểm bản ghi được cập nhật gần nhất | Có | DateTime |

MVP chưa cần:

- `createdBy`
- `updatedBy`

Lý do: tool hiện là single-user local, chưa có authentication, user account, role hoặc permission. Thêm các field này lúc này làm model phức tạp hơn nhưng chưa mang lại giá trị thực tế.

## 11. Logic tạo Project Overview

Project Overview không nên là entity lưu riêng. Đây là màn hình tổng hợp từ dữ liệu hiện có.

Dữ liệu đầu vào:

- `Project`: tên, trạng thái, owner, ngày kết thúc, objective, healthNote.
- `WorkItem`: số lượng theo status, mục quá hạn, mục sắp đến hạn, mục blocked.
- `Risk`: risk đang mở, risk mức HIGH, risk cần review theo dueDate.
- `Issue`: issue đang mở, issue quá hạn, issue chưa có owner.
- `Meeting`: các cuộc họp gần đây và quyết định mới.
- `WeeklyReport`: báo cáo tuần mới nhất.

Logic dữ liệu:

```text
Project
+
WorkItem summary
+
Open Risks
+
Open Issues
+
Recent Meetings
+
Latest Weekly Report
↓
Project Overview
```

## 12. Logic tạo Weekly Report

Weekly Report nên được tạo từ dữ liệu dự án trong khoảng `weekStart` đến `weekEnd`, sau đó PM chỉnh sửa và lưu snapshot.

Nguồn dữ liệu:

- WorkItem hoàn thành trong tuần dựa trên `completedAt`.
- WorkItem đang làm hoặc bị chặn dựa trên `status`.
- WorkItem sắp đến hạn hoặc quá hạn dựa trên `dueDate`.
- Risk đang mở, đang monitoring hoặc severity HIGH.
- Issue đang mở hoặc đang xử lý.
- Meeting trong tuần dựa trên `meetingDate`.
- Decisions trong Meeting của tuần.
- Ghi chú tổng quan do PM nhập.

Luồng:

```text
WorkItem hoàn thành trong tuần
+
WorkItem đang làm / bị chặn
+
Risk đang mở
+
Issue đang mở
+
Meeting / Decision trong tuần
↓
Weekly Report draft
↓
PM review
↓
Save snapshot
```

## 13. Những dữ liệu chưa cần cho MVP

- **User**: chưa cần vì MVP là single-user local.
- **Role**: chưa có nhiều người dùng hoặc phân quyền.
- **Permission**: chưa có authentication và workflow phê duyệt.
- **Organization**: chưa cần quản lý nhiều công ty hoặc workspace.
- **Comment**: ghi chú có thể nằm trong description, notes hoặc resolution.
- **Attachment**: MVP chưa quản lý tài liệu hoặc file đính kèm.
- **Audit Log đầy đủ**: `createdAt` và `updatedAt` là đủ cho giai đoạn đầu.
- **Notification**: MVP chưa có nhắc việc tự động.
- **Integration mapping**: chưa tích hợp Jira, Slack, email, calendar hoặc cloud service.
- **Document**: quản lý tài liệu nằm ngoài phạm vi MVP hiện tại.

## 14. Data Model cuối cùng

Entity cuối cùng cho MVP:

- **Project**: lưu thông tin nền và trạng thái của dự án.
- **WorkItem**: quản lý cả Task và Action Item trong một danh sách chung.
- **Meeting**: lưu biên bản họp, người tham gia, summary và decisions.
- **Risk**: theo dõi rủi ro tương lai, severity và mitigation.
- **Issue**: theo dõi vấn đề đã xảy ra, owner, trạng thái và resolution.
- **WeeklyReport**: lưu báo cáo tuần dưới dạng snapshot sau khi PM rà soát.

Mô hình này đủ để:

- Tạo Project Overview từ dữ liệu hiện có.
- Theo dõi Task, Action Item, Risk và Issue theo từng Project.
- Lưu Meeting Minutes và liên kết Action Item về Meeting nguồn.
- Tạo Weekly Report draft từ dữ liệu dự án và lưu snapshot sau khi chỉnh sửa.
