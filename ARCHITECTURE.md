# ARCHITECTURE - Tool-Project-manage

## 1. Architecture Overview - Tong quan kien truc

Kien truc MVP nen la **local web app**: ung dung chay tren may ca nhan, nguoi dung mo bang trinh duyet, du lieu luu local.

```text
Project Manager
    ↓
Browser UI
    ↓
Next.js + TypeScript
    ↓
Server Actions / Application Logic
    ↓
SQLite local database
    ↓
Local computer
```

Ly do chon huong nay:

- Phu hop voi cong cu ca nhan cho PM.
- Khong can cloud, login, multi-user hay deploy.
- UI qua trinh duyet du de su dung va phat trien nhanh.
- Du lieu local ben vung hon so voi chi luu tren browser.
- Van co duong mo rong cho AI, Jira, Google Drive, Slack sau nay.

## 2. So sanh cac phuong an chay ung dung

| Phuong an | Uu diem | Nhuoc diem | Phu hop MVP |
| --------- | ------- | ---------- | ----------- |
| A. Web App chay local | De phat trien, UI qua browser quen thuoc, khong can cai desktop app rieng, de mo rong API/AI sau nay | Can chay local server tren may ca nhan | Co. Phu hop nhat |
| B. Desktop App | Cam giac nhu ung dung rieng, co the dong goi thanh app | Tang do phuc tap, can Electron/Tauri, build va package phien ban | Chua can cho MVP |
| C. Cloud Web App | De truy cap nhieu may, de chia se, de tich hop dich vu cloud | Can deploy, bao mat, login, backup, chi phi ha tang | Khong phu hop MVP hien tai |

**Lua chon:** Web App chay local.

## 3. Frontend

De xuat:

- **Next.js**: framework React ho tro UI va logic server trong cung mot project.
- **React**: thu vien xay dung giao dien theo component.
- **TypeScript**: ngon ngu JavaScript co type (kieu du lieu) giup giam loi khi du an lon dan.

Vi sao phu hop:

- Next.js giup gom UI, routing (dieu huong), form va logic xu ly trong mot codebase don gian.
- React phu hop voi cac man hinh MVP: Project List, Overview, Work Items, Risk & Issue, Meetings, Weekly Reports.
- TypeScript huu ich vi project co nhieu entity nghiep vu: Project, Work Item, Risk, Issue, Meeting, Decision, Weekly Report.
- Khong qua phuc tap neu chi dung cac tinh nang can thiet cua Next.js, tranh cau hinh nang ngay tu dau.

## 4. Backend

MVP **chua can backend rieng**.

| Phuong an | Nhan xet |
| --------- | -------- |
| Next.js Server Actions / API Route | Du cho form submit, validate, doc/ghi du lieu local, tao bao cao. Giu project gon nhe |
| Backend rieng nhu NestJS | Manh cho he thong lon, multi-user, API phuc tap, permission, integration rieng. Qua nang cho MVP |

**Lua chon:** dung **Next.js Server Actions** cho logic chinh. Chi them API Route khi can endpoint ro rang cho tinh nang sau nay.

## 5. Local Database - Co so du lieu local

| Phuong an | Uu diem | Nhuoc diem |
| --------- | ------- | ---------- |
| JSON file | Rat de bat dau, de doc bang mat thuong, backup bang cach copy file | Kho query, de loi khi du lieu lon hon, kho lien ket Project/Task/Meeting/Risk/Issue, kho validate consistency |
| SQLite | Nhe, chay local, mot file database, query tot, phu hop du lieu co quan he, de backup | Can migration va lop data access co ky luat |

**Lua chon:** **SQLite**.

Ly do:

- Project can quan ly nhieu nhom du lieu co lien quan voi nhau.
- Overview va Weekly Report can tong hop, loc, dem, tim muc qua han.
- SQLite van don gian vi chi la mot file local, khong can server database.
- Backup co the thuc hien bang cach copy file database.
- De mo rong hon JSON khi them AI hoac integration sau nay.

## 6. ORM / Data Access

Neu dung SQLite, co ba huong:

| Phuong an | Nhan xet |
| --------- | -------- |
| Prisma | Developer experience tot, schema ro rang, migration tot, nhung co the hoi nang cho tool ca nhan nho |
| Drizzle | Nhe hon Prisma, type-safe, hop voi TypeScript, kiem soat SQL tot |
| Khong dung ORM | Don gian luc dau, nhung de lap SQL va kho maintain khi module tang |

**Lua chon:** **Drizzle ORM** cho MVP.

Ly do:

- Nhe, phu hop voi Next.js + TypeScript + SQLite.
- Co type-safety (an toan kieu du lieu) ma khong qua nang.
- De viet query phuc vu Overview va Weekly Report.
- Khong can thiet ke database schema trong session nay; chi xac dinh huong data access.

## 7. Kien truc module

Module nghiep vu high-level:

- **Project**: quan ly thong tin co ban va trang thai tung du an.
- **Work Item**: quan ly Task va Action Item trong cung mot module.
- **Risk**: theo doi rui ro, muc do uu tien va phuong an giam thieu.
- **Issue**: theo doi van de, owner, deadline va cach xu ly.
- **Meeting**: luu bien ban hop, summary va decision.
- **Report**: tao Weekly Status Report tu du lieu du an.
- **Overview**: tong hop du lieu tu Work Item, Risk, Issue, Meeting va Report.

Quan he khái niem:

- Mot Project co nhieu Work Item, Risk, Issue, Meeting va Weekly Report.
- Meeting co the tao Action Item sau khi PM xac nhan.
- Overview khong nen luu nhieu du lieu rieng; nen tong hop tu cac module khac.
- Weekly Report lay du lieu da luu, sau do PM co the chinh sua noi dung truoc khi hoan tat.

## 8. Cau truc source code du kien

Chi la cau truc du kien, **khong tao thu muc trong session nay**.

```text
src/
  app/
    projects/
    overview/
    work-items/
    risks-issues/
    meetings/
    reports/
  components/
    ui/
    layout/
  modules/
    project/
    work-item/
    risk/
    issue/
    meeting/
    report/
    overview/
  lib/
    db/
    validation/
    date/
  data/
    local/
```

Giai thich ngan:

- `app/`: routes va pages cua Next.js.
- `components/`: UI components dung chung.
- `modules/`: business logic theo tung module.
- `lib/db/`: ket noi SQLite, query va migration.
- `lib/validation/`: validate input tu form.
- `data/local/`: vi tri du kien cho file du lieu local khi can.

## 9. Data Flow - Luong du lieu

Vi du PM tao Task:

```text
PM nhap Task tren UI
    ↓
Form goi Server Action
    ↓
Application Logic validate du lieu
    ↓
Data Access ghi vao SQLite
    ↓
Overview doc du lieu moi
    ↓
Weekly Report tong hop khi PM tao bao cao
```

Vi du Meeting tao Action Item:

```text
PM nhap Meeting Minutes
    ↓
PM xac nhan Action Item
    ↓
Application Logic tao Work Item loai Action Item
    ↓
SQLite luu Meeting va Work Item
    ↓
Overview hien thi muc can theo doi
```

## 10. AI Integration trong tuong lai

MVP hien tai **khong implement AI**. Chi du phong kien truc de sau nay co the them.

```text
Meeting Notes / Weekly Data
    ↓
AI Service Layer
    ↓
Summary / Suggested Action Items / Draft Report
    ↓
PM review and edit
    ↓
Save to SQLite
```

Nguyen tac khi them AI:

- AI chi de goi y, PM van la nguoi xac nhan cuoi.
- Khong dua API key vao source code.
- Tach AI Service thanh module rieng de co the doi provider sau nay.
- Khong lam AI trong MVP dau tien de tranh tang phuc tap.

## 11. Nhung cong nghe khong can cho MVP

| Cong nghe | Ly do chua can |
| --------- | -------------- |
| Docker | Ung dung chi chay local, chua can dong goi moi truong phuc tap |
| Redis | Chua co cache, queue hay realtime workload |
| PostgreSQL | Can server database rieng, qua nang so voi local single-user |
| Microservices | MVP nho, tach service lam tang chi phi maintain |
| Kubernetes | Chi phu hop ha tang cloud/container lon |
| Authentication | Chi mot nguoi dung tren may ca nhan, chua can login |
| Cloud infrastructure | Chua deploy cloud, chua multi-user |
| Message Queue | Chua co job nen, workflow bat dong bo lon hay integration phuc tap |

## 12. Tech Stack cuoi cung

| Layer | Technology | Vai tro |
| ----- | ---------- | ------- |
| UI | React trong Next.js | Xay dung giao dien browser cho PM |
| Language | TypeScript | Giam loi va mo ta ro entity nghiep vu |
| Application | Next.js Server Actions | Xu ly form, validate va dieu phoi logic local |
| Database | SQLite | Luu du lieu local ben vung trong mot file |
| Data Access | Drizzle ORM | Query type-safe va giu lop truy cap du lieu gon nhe |
| Runtime | Node.js local | Chay Next.js tren may ca nhan |

## 13. Architecture Decision

Kien truc duoc chon cho MVP:

```text
Browser
    ↓
Next.js + TypeScript
    ↓
Server Actions / Local Application Logic
    ↓
Drizzle ORM
    ↓
SQLite
    ↓
Local computer
```

Day la phuong an phu hop nhat voi MVP vi:

- Don gian hon Desktop App va Cloud Web App.
- Khong can backend rieng.
- Du manh de quan ly Project, Work Item, Risk, Issue, Meeting va Weekly Report.
- Du lieu local ben vung, de backup.
- Co kha nang mo rong sang AI va integration sau nay ma khong phai doi kien truc qua som.

Ket luan: MVP nen bat dau bang **local Next.js web app voi TypeScript, Server Actions, SQLite va Drizzle ORM**.
