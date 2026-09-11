# UI/UX Flow - Tool-Project-manage MVP

## 1. Navigation Structure - Cau truc dieu huong

MVP nen dung **sidebar co dinh ben trai ket hop voi header nhe ben tren**.

Ly do:

- Tool duoc dung chu yeu tren desktop, sidebar giup PM chuyen module nhanh hon top navigation.
- Cac module co tinh chat nghiep vu ro rang: Project, Overview, Work Items, Meetings, Risks, Issues, Weekly Reports.
- Sidebar de mo rong sau nay neu them Documents, Daily Report hoac Settings.
- Header co the dung cho thong tin theo ngu canh nhu project dang chon, search ngan va action chinh.

Khong nen chi dung top navigation vi menu se dai khi module tang len. Khong nen ket hop qua phuc tap voi nhieu cap menu trong MVP.

### Menu chinh

```text
Projects
Project Overview
Work Items
Meetings
Risks
Issues
Weekly Reports
```

### Cau truc layout de xuat

```text
Sidebar co dinh
  - Logo / ten app
  - Project switcher ngan
  - Menu module

Header
  - Ten project dang chon
  - Trang thai project
  - Action chinh cua man hinh hien tai

Main content
  - Noi dung theo tung module
```

### Nguyen tac dieu huong

- `Projects` la noi chon, tao va quan ly danh sach project.
- Sau khi chon project, mac dinh di den `Project Overview`.
- Cac module con luon lam viec trong project dang chon.
- Neu chua co project nao, cac menu con nen hien empty state yeu cau tao project truoc.
- Project switcher nen co trong sidebar de PM doi project ma khong quay lai danh sach.

## 2. Screen List - Danh sach man hinh MVP

MVP khong can tach moi thao tac thanh mot page rieng. Nen giu so page it, cac thao tac tao/sua dung drawer hoac modal.

### Man hinh can co

| Screen | Muc dich | Hinh thuc |
| --- | --- | --- |
| Project List | Xem, tim va chon project | Page |
| Create/Edit Project | Tao hoac sua thong tin project | Drawer hoac modal |
| Project Overview | Nam nhanh tinh trang mot project | Page |
| Work Items | Quan ly Task va Action Item | Page |
| Create/Edit Work Item | Tao/sua Task hoac Action Item | Drawer |
| Meeting List | Xem lich su meeting | Page |
| Meeting Detail / Meeting Minutes | Tao/sua va doc bien ban hop | Page detail |
| Risk Log | Theo doi risk cua project | Page |
| Create/Edit Risk | Tao/sua risk | Drawer |
| Issue Log | Theo doi issue cua project | Page |
| Create/Edit Issue | Tao/sua issue | Drawer |
| Weekly Reports | Xem danh sach report da tao | Page |
| Weekly Report Detail | Tao draft, sua va copy report | Page detail |

### Khong can tach rieng trong MVP

- Khong can dashboard tong hop tat ca project.
- Khong can trang rieng cho Action Item vi da nam trong `Work Items`.
- Khong can trang rieng cho Decision vi decisions duoc luu trong Meeting.
- Khong can Settings neu chua co tuy chon cau hinh thuc su.

## 3. Project List Screen

### Muc dich

Giup PM nhin nhanh cac project dang quan ly, mo project can lam viec hoac tao project moi.

### Du lieu hien thi

Nen dung table don gian vi PM co the co nhieu project va can scan nhanh.

Cot de xuat:

| Cot | Ghi chu |
| --- | --- |
| Project name | Ten project, click de mo Overview |
| Status | Planning, Active, On hold, Completed |
| Owner | PM hoac nguoi phu trach |
| End date | Ngay ket thuc du kien |
| Open work items | So Task/Action Item chua done |
| Open risks/issues | So risk va issue can chu y |

Khong nen dua qua nhieu thong tin nhu description, objective, latest meeting vao table. Cac thong tin nay de trong Project Overview.

### Action chinh

- `New Project`
- `Open Project`
- `Edit Project`
- `Mark as Completed`

### Empty state

Neu chua co project:

- Hien thong diep ngan: chua co project nao.
- Nut chinh: `Create first project`.
- Khong hien dashboard gia hoac nhieu huong dan dai.

### Search/filter

MVP chi can:

- Search theo ten project.
- Filter theo status.

Chua can filter theo owner, date range hoac customer trong MVP.

## 4. Project Overview Screen

### Muc dich

Day la man hinh quan trong nhat. PM mo tool len can biet ngay project co on khong, viec nao dang tre, risk/issue nao can xu ly va buoc tiep theo la gi.

### Layout de xuat

```text
Header
  - Project name
  - Status
  - End date
  - Quick actions

Top summary row
  - Project Summary
  - Work Progress
  - Attention Needed

Main grid
  - Upcoming / Overdue Work Items
  - Open Risks
  - Open Issues
  - Recent Meetings
  - Latest Weekly Report
```

### Block 1: Project Summary

Hien ngay:

- Project status.
- Owner.
- Start date va end date.
- Objective ngan.
- Health note gan nhat.

Action:

- `Edit Project`
- `Update Health Note`

### Block 2: Progress / Work Items

Hien summary:

- Tong so Work Items.
- So item Done, In Progress, Blocked, Overdue.
- Ti le hoan thanh don gian theo Done / Total.

Khong can bieu do phuc tap trong MVP. Mot progress bar nho va so lieu la du.

Action:

- `Add Work Item`
- `View Work Items`

### Block 3: Upcoming Deadline

Hien danh sach ngan:

- Toi da 5 item sap den han hoac qua han.
- Title.
- Owner.
- Due date.
- Status.

Neu nhieu hon 5 item, hien link `View all`.

### Block 4: Open Risks

Hien summary:

- So risk open/monitoring.
- So risk severity HIGH.
- Toi da 3 risk can chu y nhat.

Action:

- `Add Risk`
- `View Risks`

### Block 5: Open Issues

Hien summary:

- So issue open/in progress.
- So issue qua han.
- So issue chua co owner.
- Toi da 3 issue can xu ly nhat.

Action:

- `Add Issue`
- `View Issues`

### Block 6: Recent Meetings

Hien summary:

- 3 meeting gan nhat.
- Meeting title.
- Meeting date.
- So action item phat sinh neu co.

Action:

- `New Meeting`
- `View Meetings`

### Block 7: Latest Weekly Report

Hien:

- Ky bao cao gan nhat.
- Overall status: Green, Yellow, Red.
- Summary ngan.

Action:

- `Generate Weekly Report`
- `Open Latest Report`

### Quick actions nen co

- `Add Work Item`
- `Add Risk`
- `Add Issue`
- `New Meeting`
- `Generate Weekly Report`

Quick actions nen dat o header hoac mot vung action ngan, khong trai khap man hinh.

## 5. Work Item Screen

### Kieu hien thi mac dinh

MVP nen dung **table/list co filter**, khong dung Kanban mac dinh.

Ly do:

- PM can scan theo owner, due date, priority va status.
- Task va Action Item co field gan nhau nen table ro rang hon.
- Kanban dep nhung de tang thao tac keo tha va logic UI khong can thiet cho MVP.
- List/table de phuc vu Weekly Report va Overview hon.

### Cot chinh

| Cot | Ghi chu |
| --- | --- |
| Type | Task hoac Action Item |
| Title | Noi dung ngan, click de sua |
| Status | TODO, IN_PROGRESS, DONE, BLOCKED |
| Priority | LOW, MEDIUM, HIGH, CRITICAL |
| Owner | Nguoi phu trach |
| Due date | Hien ro neu overdue |
| Source | Meeting, PM note, stakeholder request |

### Filter toi thieu

- Status.
- Type.
- Priority.

Co the them search theo title neu khong lam tang phuc tap. Chua can filter owner trong ban dau neu project nho.

### Action chinh

- `Add Work Item`
- Sua nhanh status.
- Mo drawer de sua chi tiet.
- Mark as Done.

### UX cho Task va Action Item

- `Type` la field bat buoc khi tao.
- Neu item tao tu Meeting, `type` mac dinh la `Action Item`.
- Neu item tao truc tiep trong Work Items, PM co the chon `Task` hoac `Action Item`.
- `Source` nen tu dong dien la meeting title khi item duoc tao tu Meeting.

## 6. Meeting Screen

### Cau truc

Nen co hai man hinh:

- `Meeting List`: danh sach meeting cua project.
- `Meeting Detail / Meeting Minutes`: tao, sua va doc bien ban.

Meeting Minutes co nhieu noi dung dai, nen dung page detail thay vi modal. Modal/drawer se chat va kho viet notes.

### Meeting List

Cot de xuat:

| Cot | Ghi chu |
| --- | --- |
| Title | Ten meeting |
| Meeting date | Ngay gio hop |
| Participants | Hien ngan, cat bot neu dai |
| Action items | So action item da tao |
| Updated | Lan cap nhat gan nhat |

Action:

- `New Meeting`
- `Open`
- `Edit`

### Meeting Detail / Meeting Minutes

Field can co:

- Title.
- Meeting date.
- Participants.
- Agenda.
- Notes.
- Summary.
- Decisions.
- Action Items.

### Co can tab khong?

MVP **khong nen dung tab** cho Meeting Detail. Nen dung cac section doc tu tren xuong:

```text
Meeting Info
Notes
Summary
Decisions
Action Items
```

Ly do:

- PM thuong ghi bien ban theo luong tu tren xuong.
- Khong bi mat noi dung trong tab.
- De review toan bo bien ban truoc khi save.

### Luong tao Meeting

```text
Create Meeting
  ↓
Nhap Meeting Info
  ↓
Nhap Notes
  ↓
Nhap Summary
  ↓
Nhap Decisions
  ↓
Nhap Action Items
  ↓
Save Meeting
  ↓
Action Items duoc tao trong Work Items voi meetingId lien ket
```

### Action Item tu Meeting

Trong section `Action Items`, PM co the them nhieu dong voi field:

- Title.
- Owner.
- Due date.
- Priority.
- Status mac dinh la TODO.

Khi save Meeting:

- Cac dong Action Item hop le se tao `WorkItem` voi `type = ACTION_ITEM`.
- `meetingId` lien ket ve Meeting.
- `source` tu dong la ten Meeting.

### Edit inline

Nen co edit inline trong section `Action Items` cua Meeting Detail vi PM thuong ghi nhanh sau hop. Cac section text dai nhu Notes, Summary, Decisions co the edit truc tiep bang textarea.

## 7. Risk Log Screen

### Muc dich

Theo doi cac rui ro co the xay ra va cac hanh dong giam thieu.

### Kieu hien thi

Dung table/list. Moi risk la mot dong, click de mo drawer sua chi tiet.

Cot chinh:

| Cot | Ghi chu |
| --- | --- |
| Title | Ten risk ngan |
| Severity | LOW, MEDIUM, HIGH |
| Probability | LOW, MEDIUM, HIGH |
| Impact | LOW, MEDIUM, HIGH |
| Owner | Nguoi theo doi |
| Due date | Ngay review/xu ly tiep |
| Status | OPEN, MONITORING, MITIGATED, CLOSED |

### Filter toi thieu

- Status.
- Severity.

Chua can filter probability/impact rieng trong MVP.

### Action chinh

- `Add Risk`
- `Edit Risk`
- `Close Risk`

### Drawer tao/sua Risk

Field can co:

- Title.
- Description.
- Probability.
- Impact.
- Severity.
- Mitigation.
- Owner.
- Due date.
- Status.

Neu sau nay co logic goi y severity tu probability va impact, UI van nen cho PM chinh sua severity thu cong.

## 8. Issue Log Screen

### Muc dich

Theo doi cac van de da xay ra, ai dang xu ly, han xu ly va ket qua.

### Kieu hien thi

Dung table/list rieng, khong gop chung voi Risk trong MVP UI chinh. Risk va Issue co cach suy nghi khac nhau: Risk la tuong lai, Issue la da xay ra.

Cot chinh:

| Cot | Ghi chu |
| --- | --- |
| Title | Ten issue ngan |
| Priority | LOW, MEDIUM, HIGH, CRITICAL |
| Owner | Nguoi xu ly |
| Due date | Hien ro neu overdue |
| Detected at | Ngay phat hien |
| Status | OPEN, IN_PROGRESS, RESOLVED, CLOSED |

### Filter toi thieu

- Status.
- Priority.

### Action chinh

- `Add Issue`
- `Edit Issue`
- `Resolve Issue`
- `Close Issue`

### Drawer tao/sua Issue

Field can co:

- Title.
- Description.
- Priority.
- Impact.
- Owner.
- Status.
- Resolution.
- Due date.
- Detected at.

## 9. Weekly Reports Screen

### Muc dich

Giup PM tao, luu va copy bao cao tuan ma khong phai tong hop lai tu nhieu noi.

### Weekly Reports List

Cot de xuat:

| Cot | Ghi chu |
| --- | --- |
| Week | Khoang ngay bao cao |
| Overall status | Green, Yellow, Red |
| Summary | Tom tat ngan |
| Updated | Lan sua gan nhat |

Action:

- `New Weekly Report`
- `Open`
- `Copy`

### Weekly Report Detail

Nen la page detail vi report can doc va chinh sua noi dung dai.

Sections:

```text
Report Info
Overall Status
Summary
Completed Work
Ongoing Work
Upcoming Work
Risks
Issues
Decisions
Notes / Support Needed
Copyable Output
```

### Luong tao Weekly Report

```text
New Weekly Report
  ↓
Chon weekStart va weekEnd
  ↓
Generate draft tu WorkItem, Risk, Issue, Meeting
  ↓
PM review va chinh sua
  ↓
Save snapshot
  ↓
Copy report de chia se ben ngoai
```

### Nguyen tac UX

- Draft chi la diem bat dau, PM phai co quyen sua moi section.
- Bao cao da save la snapshot, khong tu dong thay doi khi task/risk/issue sau do thay doi.
- Nut `Copy Report` nen ro rang va dat gan vung output.

## 10. End-to-End User Flow

### Flow chinh

```text
Mo tool
  ↓
Xem Project List
  ↓
Chon project hoac tao project moi
  ↓
Vao Project Overview
  ↓
Them/cap nhat Work Items, Risks, Issues
  ↓
Tao Meeting Minutes neu co cuoc hop
  ↓
Action Items tu Meeting duoc dua vao Work Items
  ↓
Quay lai Overview de xem muc can chu y
  ↓
Cuoi tuan tao Weekly Report
  ↓
Review, save snapshot va copy report
```

### Flow khi chua co project

```text
Mo tool
  ↓
Project List empty state
  ↓
Create first project
  ↓
Vao Project Overview cua project moi
```

### Flow cap nhat nhanh

```text
Mo project
  ↓
Overview
  ↓
Click Add Work Item / Add Risk / Add Issue
  ↓
Nhap thong tin trong drawer
  ↓
Save
  ↓
Overview cap nhat summary
```

## 11. UI Principles cho MVP

- Desktop-first, content rong, table de scan.
- It page, form ngan, action ro.
- Overview la trung tam, cac module con dung de quan ly chi tiet.
- Khong lam dashboard phuc tap voi nhieu chart.
- Dung badge/status color co y nghia, nhung khong phu thuoc hoan toan vao mau.
- Moi man hinh chi nen co mot action chinh noi bat.
- Form nen co validation don gian va thong bao loi gan field.
- Empty state ngan gon, co action tiep theo ro rang.
- Khong can animation hoac visual effect trong MVP.

## 12. MVP Screen Priority

Thu tu nen thiet ke va implement UI sau nay:

1. Project List va Create/Edit Project.
2. Project Overview khung co ban.
3. Work Items.
4. Risk Log va Issue Log.
5. Meeting List va Meeting Detail.
6. Weekly Reports va Weekly Report Detail.

Thu tu nay phu hop voi logic phat trien da neu trong MVP: co Project truoc, co Work Items/Risk/Issue truoc, sau do Overview va Report moi co du lieu that de tong hop.

## 13. Ket luan

UI/UX cho MVP nen tap trung vao mot local web app don gian cho PM:

- Sidebar co dinh de dieu huong module.
- Project Overview la man hinh trung tam.
- Table/list la kieu hien thi mac dinh cho cac log nghiep vu.
- Drawer dung cho form tao/sua ngan.
- Page detail dung cho Meeting Minutes va Weekly Report vi co noi dung dai.
- Weekly Report duoc tao tu draft nhung luu thanh snapshot sau khi PM review.

Cach thiet ke nay giu MVP gon, de implement bang Next.js sau nay va van du de mo rong khi them AI, integration hoac document management trong cac giai doan tiep theo.
