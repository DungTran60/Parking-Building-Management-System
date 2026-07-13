# LOG LỖI TOÀN BỘ HỆ THỐNG - PARKING BUILDING MANAGEMENT SYSTEM

> Ngày phân tích: 13/07/2026
> Phạm vi: Toàn bộ FE (React/TypeScript) + BE (Spring Boot/Java)

---

## MỤC LỤC
1. [LỖI CRITICAL - Toàn hệ thống](#1-lỗi-critical)
2. [LỖI THEO ROLE ADMIN](#2-lỗi-role-admin)
3. [LỖI THEO ROLE MANAGER](#3-lỗi-role-manager)
4. [LỖI THEO ROLE STAFF](#4-lỗi-role-staff)
5. [LỖI THEO ROLE DRIVER](#5-lỗi-role-driver)
6. [LỖI BACK-END (CHUNG)](#6-lỗi-back-end-chung)
7. [LỖI FRONT-END (CHUNG)](#7-lỗi-front-end-chung)
8. [LỖI PHÂN QUYỀN / BẢO MẬT](#8-lỗi-phân-quyền--bảo-mật)
9. [LỖI LOGIC NGHIỆP VỤ](#9-lỗi-logic-nghiệp-vụ)
10. [LỖI API / DỮ LIỆU](#10-lỗi-api--dữ-liệu)

---

## 1. LỖI CRITICAL

### C1. [CHECK-OUT] Không gọi API checkout khi thanh toán
**File:** `FE/src/pages/staff/CheckOutPage.tsx:178-189`
- **Mô tả:** Luồng Check-Out hiện tại dùng `sessionApi.list()` (GET /api/sessions) để **tra cứu** session, sau đó gọi `paymentApi.create()` (POST /api/payments) để tạo payment. **Không có lời gọi `sessionApi.checkOut()` (POST /api/sessions/checkout)** nào được thực hiện.
- **Hậu quả:** Session **không bao giờ được checkout**. Session vẫn ở trạng thái ACTIVE, slot vẫn OCCUPIED, phí không được tính. Xe không thể rời bãi một cách hợp lệ.
- **Nghiêm trọng:** CRITICAL - Toàn bộ luồng check-out bị hỏng.

### C2. [CHECK-OUT] PaymentPage cũng không trigger checkout
**File:** `FE/src/pages/user/PaymentPage.tsx:49-64`
- **Mô tả:** PaymentPage của Driver cũng chỉ gọi `paymentApi.create()` mà không gọi checkout API. Driver thanh toán nhưng session không bao giờ được đóng, slot không được giải phóng.
- **Hậu quả:** Giống C1.
- **Nghiêm trọng:** CRITICAL

### C3. [BACK-END] Check-out tự động set COMPLETED không qua payment
**File:** `BE/.../service/ParkingSessionServiceImpl.java:225`
- **Mô tả:** `checkOut()` set `session.setStatus("COMPLETED")` ngay lập tức, không kiểm tra payment. Trong khi document yêu cầu: Payment → COMPLETED, chưa payment → PENDING_PAYMENT.
- **Nghiêm trọng:** CRITICAL - Vi phạm workflow tài chính.

### C4. [BACK-END] Lost-ticket checkout cũng không qua payment
**File:** `BE/.../service/ParkingSessionServiceImpl.java:325`
- **Mô tả:** `lostTicketCheckout()` set `session.setStatus("LOST_TICKET")` ngay lập tức.
- **Nghiêm trọng:** CRITICAL

### C5. [BE+FE] Kiểu dữ liệu PricingPolicy hoàn toàn khác nhau
- **FE type:** `PricingPolicy` có `firstHour`, `nextHour`, `dayPrice`, `wrongZoneFee`, `overtimeFee`
- **BE entity:** `Pricing` có `price` (chỉ 1 giá), `overnightFee`, `lostTicketFee` - không có firstHour, nextHour, dayPrice
- **Hậu quả:** FE hiển thị và tính phí sai hoàn toàn so với BE. FeeCalculationService chỉ tính `rate * hours`, không hỗ trợ giá giờ đầu/giờ tiếp theo/giá ngày.
- **Nghiêm trọng:** CRITICAL - Sai toàn bộ logic tính phí.

---

## 2. LỖI ROLE ADMIN

### A1. [FE] DefaultAppPage redirect ADMIN đến /app/dashboard nhưng ADMIN không có permission `dashboard:view`
**File:** `FE/src/routes/router.tsx:40-45` + `FE/src/constants/rbac.ts:48-52`
- **Mô tả:** ADMIN được redirect đến `/app/dashboard` sau login. Dashboard yêu cầu `dashboard:view`. Nhưng `DEFAULT_ROLE_PERMISSIONS.SYSTEM_ADMIN` chỉ có `["users:manage", "settings:manage", "audit:view"]` - **không có `dashboard:view`**.
- **Hậu quả:** Admin login xong bị redirect đến trang 403 Forbidden.
- **Fix:** Thêm `"dashboard:view"` vào permissions của SYSTEM_ADMIN.

### A2. [FE] Logout vẫn còn lưu role = SYSTEM_ADMIN
**File:** `FE/src/stores/authStore.ts:58`
```typescript
set({ role: "SYSTEM_ADMIN", userName: "", isAuthenticated: false });
```
- **Mô tả:** Sau logout, role được set thành `SYSTEM_ADMIN` thay vì một giá trị trung tính. Nếu component nào đó kiểm tra `role` trước `isAuthenticated` sẽ thấy ADMIN.
- **Fix:** Nên set role về `PARKING_USER` hoặc `""`.

### A3. [FE] AuditLogsPage không filter được theo thời gian
**File:** `FE/src/pages/admin/AuditLogsPage.tsx`
- **Mô tả:** API audit logs hỗ trợ paging nhưng không có filter date range trên UI.
- **Hậu quả:** Khó tra cứu log cụ thể.

### A4. [BE] UserController không có API lấy danh sách ADMIN
**File:** `BE/.../controller/UserController.java`
- **Mô tả:** Có API `/api/users/staff` cho Staff, nhưng không có API tương tự cho ADMIN để quản lý.
- **Hậu quả:** Hạn chế.

### A5. [BE] Admin có thể tự xóa role của mình thành STAFF/MANAGER (thiếu kiểm tra)
**File:** `BE/.../service/UserServiceImpl.java:177-186`
- **Mô tả:** Admin có thể tự đổi role của mình thành STAFF/MANAGER. Chỉ kiểm tra "last active admin" nhưng không kiểm tra "current user".
- **Hậu quả:** Admin tự hạ quyền mình, mất khả năng quản trị.

---

## 3. LỖI ROLE MANAGER

### M1. [FE] Manager không thể tạo sự cố (incident) từ UI
**File:** `FE/src/pages/shared/IncidentPage.tsx:574`
```typescript
const canCreate = isStaff; // Manager KHÔNG được phép tạo
```
**File:** `BE/.../controller/IncidentController.java:32`
```java
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DRIVER')") // Manager không có quyền
```
- **Mô tả:** Cả FE lẫn BE đều không cho Manager tạo incident, nhưng document mapping table (dòng 27) ghi: Staff (✔), Driver (✔) - Manager không có ✔. Nhưng workflow sự cố 5.3 và "Manager xem danh sách sự cố OPEN / phân công Staff" - Manager cần khả năng tạo incident khi giám sát.
- **Hậu quả:** Manager phát hiện sự cố nhưng không thể tạo, phải nhờ Staff hoặc Driver.

### M2. [BE] AssignIncident tự động chuyển OPEN → IN_PROGRESS sai workflow
**File:** `BE/.../service/IncidentServiceImpl.java:166`
```java
incident.setStatus(IncidentStatus.IN_PROGRESS);
```
- **Mô tả:** Theo document (Workflow 5.3): Manager assign → status vẫn OPEN → Staff nhận xử lý → IN_PROGRESS. Nhưng `assignIncident` tự động chuyển thẳng sang IN_PROGRESS, **bỏ qua bước Staff nhận xử lý**.
- **Hậu quả:** Staff không thể "nhận" incident vì đã IN_PROGRESS ngay khi assign.

### M3. [BE] startProcessing() không cho Staff đã được assign xử lý
**File:** `BE/.../service/IncidentServiceImpl.java:186`
```java
if (incident.getAssignee() != null) {
    throw new ResourceConflictException("Incident is already being processed by ...");
}
```
- **Mô tả:** Manager assign → assignee != null, status = OPEN (nếu fix M2) hoặc IN_PROGRESS (hiện tại). Nhưng nếu assignee != null và status OPEN, Staff không thể `startProcessing` vì lỗi "already being processed". Staff đã được assign nhưng vẫn không thể bắt đầu xử lý.
- **Hậu quả:** Staff bị chặn, không thể xử lý incident đã được giao cho mình.

### M4. [FE] Manager không thể xem "Tổng quan Dashboard" (slots/user mode)
**File:** `FE/src/pages/shared/DashboardPage.tsx`
- **Mô tả:** Dashboard cho Manager chỉ hiển thị báo cáo (revenue, occupancy, traffic). Không có chế độ xem nhanh như Staff (số xe đang gửi, slot trống, sự cố đang mở).
- **Hậu quả:** Manager thiếu thông tin real-time.

### M5. [FE] Report không có filter vehicle type
**File:** `FE/src/pages/manager/ReportsPageLive.tsx`
- **Mô tả:** Báo cáo doanh thu không filter được theo loại xe.
- **Hậu quả:** Hạn chế phân tích.

---

## 4. LỖI ROLE STAFF

### S1. [FE] Check-In Page gửi slotId là number, BE lại nhận String
**File:** `FE/src/pages/staff/CheckInPage.tsx:148`
```typescript
slotId: values.slotId?.trim() ? Number(values.slotId) : undefined
```
**File:** `BE/.../dto/CheckInRequestDto.java` - `slotId` là `Long`
- **Mô tả:** FE convert `slotId` thành Number, có thể là NaN. BE mong đợi Long. Nếu slotId để trống, FE gửi `undefined`, BE nhận null.
- **Hậu quả:** Không khớp kiểu dữ liệu, có thể gây lỗi parse.

### S2. [FE] Check-In không kiểm tra biển số xe đã có session ACTIVE trước khi submit
- **Mô tả:** BE có validation `validateActiveSession()` (ParkingSessionServiceImpl.java:76-79) nhưng FE không check trước khi submit. Nếu biển số trùng, user phải đợi BE trả về lỗi 409 mới biết.
- **Hậu quả:** UX kém, lãng phí request.

### S3. [FE] Check-Out dùng sai API endpoint để tìm session
**File:** `FE/src/pages/staff/CheckOutPage.tsx:178-189`
- **Mô tả:** Check-Out dùng `sessionApi.list()` (GET /api/sessions) thay vì một API tìm kiếm riêng. API này yêu cầu role STAFF/MANAGER/ADMIN (đúng), nhưng trả về trang đầu tiên của danh sách, không phải kết quả tìm kiếm chính xác.
- **Hậu quả:** Nếu có nhiều session, kết quả tìm kiếm có thể sai.
- **Liên quan:** Critical C1.

### S4. [FE] Không có UI cho Staff xem danh sách đặt chỗ (reservation) để check-in
**File:** `FE/src/pages/staff/CheckInPage.tsx`
- **Mô tả:** Staff không có tab/list reservation để xem ai đã đặt chỗ, cần check-in cho ai. Phải yêu cầu Driver cung cấp reservationId.

### S5. [FE] Exceptions Modals chưa hoàn thiện
**File:** `FE/src/modules/sessions/ExceptionModals.tsx`
- **Mô tả:** Chỉ modal "Lost Ticket" hoạt động, các ngoại lệ khác (Wrong Plate, Wrong Zone, Overtime, Unpaid) bị disable.

### S6. [BE] Check-out không kiểm tra slot đã được giải phóng trước đó
**File:** `BE/.../service/ParkingSessionServiceImpl.java:229-231`
```java
ParkingSlot slot = session.getSlot();
slot.setStatus(SlotStatus.AVAILABLE);
```
- **Mô tả:** Không kiểm tra xem slot đã AVAILABLE chưa trước khi set.
- **Hậu quả:** Nếu slot đã AVAILABLE từ trước (do bug), set lại AVAILABLE không gây hại.

---

## 5. LỖI ROLE DRIVER

### D1. [FE] Driver không có UI để tạo incident (dù BE cho phép)
**File:** `FE/src/pages/user/FeedbackPage.tsx`
- **Mô tả:** FeedbackPage gọi `incidentApi.create()` để tạo incident nhưng **không có trường nhập sessionId** (để liên kết với session cụ thể). Document yêu cầu Driver có thể tạo sự cố liên quan đến session (mất vé, sai phí...).
- **Hậu quả:** Driver không thể tạo sự cố gắn với session cụ thể.

### D2. [FE] Driver không có permission `exceptions:manage` để xem incident list
**File:** `FE/src/constants/rbac.ts:75-81`
- **Mô tả:** Driver không thể vào `/app/incidents`. Driver chỉ có thể vào `/app/feedback`.
- **Hậu quả:** Driver không thể theo dõi trạng thái sự cố đã gửi.

### D3. [FE] ReservationsPage chỉ show AVAILABLE slots, không show RESERVED
**File:** `FE/src/pages/user/ReservationsPage.tsx:61`
```typescript
const availableSlots = useMemo(() => slotRows.filter(
  (slot) => String(slot.vehicleTypeId) === String(vehicleTypeId) && slot.status === "AVAILABLE"
), [slotRows, vehicleTypeId]);
```
- **Mô tả:** Chỉ hiển thị slot AVAILABLE. Không hiển thị slot RESERVED (đã có người đặt) để Driver biết khu vực nào đang kín.
- **Hậu quả:** UX kém.

### D4. [FE] ReservationsPage không có validation plateNumber
**File:** `FE/src/pages/user/ReservationsPage.tsx:64-90`
- **Mô tả:** Chỉ kiểm tra plateNumber không empty, không có regex validation hay format check.
- **Hậu quả:** Driver có thể nhập biển số sai format.

### D5. [FE] PaymentPage dùng `sessionApi.getMySessions` không có status filter
**File:** `FE/src/pages/user/PaymentPage.tsx:27-30`
```typescript
queryFn: () => sessionApi.getMySessions("ACTIVE")
```
- **Mô tả:** Chỉ load session ACTIVE. Nếu session đã UNPAID, sẽ không show.
- **Hậu quả:** Driver không thể thanh toán các session UNPAID.

### D6. [BE] Reservation tạo ra không tự động CONFIRMED
**File:** `BE/.../service/ReservationServiceImpl.java`
- **Mô tả:** Sau khi tạo, reservation ở trạng thái PENDING. Chỉ ADMIN/MANAGER mới có quyền CONFIRM. Driver không thể auto-confirm.
- **Hậu quả:** Slot bị RESERVED nhưng reservation không CONFIRMED. Staff không thể check-in vì `handleReservation` yêu cầu status CONFIRMED (dòng 104).
- **Nghiêm trọng:** Driver không thể check-in sau khi đặt chỗ.

---

## 6. LỖI BACK-END (CHUNG)

### BE1. [Security] GET /api/slots/** cho phép mọi authenticated user
**File:** `BE/.../config/SecurityConfig.java:40`
```java
.requestMatchers(HttpMethod.GET, "/api/slots/**").authenticated()
```
- **Mô tả:** Bất kỳ user nào (kể cả Driver) cũng có thể GET tất cả slots, bao gồm slots OCCUPIED, slot của các loại xe khác. Không có filter phân quyền theo role trên GET.

### BE2. [Security] GET /api/building không yêu cầu role cụ thể
**File:** `BE/.../controller/BuildingController.java:23`
```java
@PreAuthorize("isAuthenticated()")
```
- **Mô tả:** Bất kỳ authenticated user nào cũng có thể xem thông tin tòa nhà. Tuy nhiên building là một record duy nhất, nên rủi ro thấp.

### BE3. [Validation] FeeCalculationServiceImpl.previewFee không validate vehicleType
**File:** `BE/.../service/FeeCalculationServiceImpl.java:49-51`
```java
return rate.hourlyRate.multiply(BigDecimal.valueOf(hours)).setScale(0, RoundingMode.HALF_UP);
```
- **Mô tả:** Nếu pricing table không có bản ghi cho vehicle type, fallback về `DEFAULT_HOURLY_RATE = 5000` và `VEHICLE_TYPE_DEFAULT` (nếu hourlyRate > 0). Không có cảnh báo cho user.
- **Hậu quả:** Phí có thể sai nếu chưa cấu hình pricing.

### BE4. [Mutation] ParkingSessionServiceImpl.updateStatus() không validate state machine
**File:** `BE/.../service/ParkingSessionServiceImpl.java:375-378`
```java
if (!List.of("ACTIVE", "COMPLETED", "UNPAID", "LOST_TICKET", "EXPIRED").contains(newStatus)) {
    throw new BadRequestException("Invalid status: " + newStatus);
}
```
- **Mô tả:** Validate rất yếu. Cho phép chuyển từ ACTIVE → COMPLETED → ACTIVE → EXPIRED → ...
- **Hậu quả:** Trạng thái session có thể bị set sai.

### BE5. [Reservation] Không có API endpoint GET /api/reservations/staff cho Staff xem
**File:** `BE/.../controller/ReservationController.java`
- **Mô tả:** Chỉ có `GET /api/reservations` trả về reservations của chính user (Driver). Staff/Manager không thể xem danh sách reservation của tất cả Driver.
- **Hậu quả:** Staff không biết ai đã đặt chỗ để chuẩn bị check-in.

### BE6. [Pricing] Delete pricing không kiểm tra ràng buộc
**File:** `BE/.../service/PricingServiceImpl.java:874-877`
```java
pricingRepository.deleteById(id);
```
- **Mô tả:** Không kiểm tra xem pricing có đang được tham chiếu bởi session nào không.
- **Hậu quả:** Xóa pricing đang dùng → session không tính được phí.

### BE7. [Incident] Không có API phân trang cho incidents
**File:** `BE/.../controller/IncidentController.java:53-61`
```java
public ResponseEntity<List<IncidentResponseDto>> findIncidents(...)
```
- **Mô tả:** Trả về List không phân trang. Khi có nhiều incident, response sẽ rất nặng.
- **Hậu quả:** Hiệu năng kém khi dữ liệu lớn.

### BE8. [ReservationExpirationScheduler] Không kiểm tra reservation đã CHECKED_IN
**File:** `BE/.../scheduler/ReservationExpirationScheduler.java`
- **Mô tả:** Cần kiểm tra kỹ: scheduler 5 phút / lần, tìm reservation RESERVED status quá hạn. Nhưng document nói cần kiểm tra "dự kiến check-in + 15-30 phút", không phải endAt.
- **Hậu quả:** Reservation bị expire sai thời điểm.

### BE9. [DataInitializer] Seed data không đồng nhất
**File:** `BE/.../config/DataInitializer.java`
- **Mô tả:** Seed data có thể không phản ánh đúng business rules (ví dụ: tạo session COMPLETED không có payment tương ứng).

---

## 7. LỖI FRONT-END (CHUNG)

### F1. [FE] httpClient không có response interceptor xử lý 401
**File:** `FE/src/api/httpClient.ts:1-17`
- **Mô tả:** Khi token hết hạn hoặc không hợp lệ, server trả 401. FE không có interceptor để tự động logout hoặc refresh token.
- **Hậu quả:** User thấy lỗi API "401 Unauthorized" không rõ ràng.

### F2. [FE] RBAC cache trong localStorage có thể lỗi thời
**File:** `FE/src/constants/rbac.ts:43-44`
```typescript
const RBAC_SCHEMA_VERSION = 6;
const ROLE_PERMISSIONS_STORAGE_KEY = `parking-bms-role-permissions-v${RBAC_SCHEMA_VERSION}`;
```
- **Mô tả:** Role-permissions được cache trong localStorage với version key. Khi permissions thay đổi trong code, cache cũ vẫn được dùng cho đến khi version tăng.
- **Hậu quả:** Permission cũ vẫn còn hiệu lực sau khi code đã thay đổi.

### F3. [FE] routing.tsx thiếu route cho ProfilePage với permission check
**File:** `FE/src/routes/router.tsx:61`
```typescript
{ path: "profile", element: <ProfilePage /> },
```
- **Mô tả:** ProfilePage không được bọc trong `protectedChild`, không có permission guard. Bất kỳ authenticated user nào cũng có thể truy cập (điều này OK), nhưng thiếu nhất quán với các route khác.

### F4. [FE] Không có loading skeleton cho các page
- **Mô tả:** Hầu hết các page chỉ hiển thị text "Đang tải..." thay vì skeleton loading.
- **Hậu quả:** UX kém.

### F5. [FE] Card component không handle empty state đồng bộ
- **Mô tả:** Nhiều page tự implement empty state riêng, không dùng component chung.

### F6. [FE] Không có error boundary
- **Mô tả:** Không có React Error Boundary bọc ứng dụng. Nếu một component crash, toàn bộ app sẽ white screen.

### F7. [FE] Build scripts có thể fail do type error
**File:** `FE/package.json:7`
```json
"build": "tsc -b && vite build"
```
- **Mô tả:** Build script chạy `tsc -b` trước, sẽ fail nếu có type error. Nhiều type error tiềm ẩn (PricingPolicy mismatch, slotId type, v.v.).
- **Hậu quả:** Build có thể không thành công.

---

## 8. LỖI PHÂN QUYỀN / BẢO MẬT

### P1. Permission `exceptions:manage` được dùng cho cả Staff và Manager nhưng có scope khác nhau
**File:** `FE/src/constants/rbac.ts:62,70`
- **Mô tả:** Cả Staff và Manager đều có `exceptions:manage`, nhưng IncidentPage.tsx dùng logic hardcode (`isStaff`, `isManager`, `isAdmin`) thay vì permission-based rendering.
- **Hậu quả:** Nếu permission thay đổi, code FE cần update thủ công.

### P2. BE `@PreAuthorize` dùng role name không prefix ROLE_
**File:** `BE/.../config/SecurityConfig.java:39`
```java
// The previous hasAnyAuthority("ADMIN", ...) rules never matched: JWT grants "ROLE_ADMIN", not "ADMIN".
```
- **Mô tả:** Comment trong code thừa nhận lỗi cũ. Hiện tại dùng `hasRole()` (tự động thêm ROLE_) nên OK. Nhưng cần kiểm tra tất cả `@PreAuthorize` xem có dùng `hasAuthority` sai không.

### P3. JWT token không có device/IP binding
**File:** `BE/.../security/JwtService.java`
- **Mô tả:** Token có thể bị đánh cắp và dùng từ device khác.
- **Hậu quả:** Rủi ro bảo mật.

### P4. Password policy được đọc từ DB settings nhưng không có cache
**File:** `BE/.../service/UserServiceImpl.java:95-98`
```java
String policyLevel = systemSettingsRepository.findById(1L)
    .map(SystemSettings::getPasswordPolicy)
    .orElse("medium");
```
- **Mô tả:** Mỗi lần createUser đều query DB. Không cache.
- **Hậu quả:** Hiệu năng kém.

---

## 9. LỖI LOGIC NGHIỆP VỤ

### L1. [Workflow] Reservation → Check-in workflow bị blocked
- **Mô tả:** Driver tạo reservation → status PENDING → Manager phải CONFIRM → status CONFIRMED → Staff check-in. Nếu Manager không confirm, Driver không thể check-in dù đã đặt chỗ. Document không nói rõ cần Manager confirm.

### L2. [Workflow] Không có trạng thái PENDING_PAYMENT
- **Mô tả:** Document (mục 5.1 step 8-9a) định nghĩa `PENDING_PAYMENT` và `DISPUTED`. Nhưng SessionStatus trong FE và BE chỉ có `ACTIVE | COMPLETED | UNPAID | LOST_TICKET | EXPIRED`. **Thiếu PENDING_PAYMENT và DISPUTED**.

### L3. [Workflow] Tranh chấp phí (Dispute) không được implement
- **Mô tả:** Document mục 5 (tranh chấp phí) mô tả: Session → DISPUTED → tạo incident → xử lý → RESOLVED → cập nhật phí → COMPLETED. **Không có code nào implement luồng này.**

### L4. [Workflow] Fee waive không kiểm tra authorization
**File:** `BE/.../service/ParkingSessionServiceImpl.java:430-440`
- **Mô tả:** `waiveFee()` yêu cầu `hasAnyRole('STAFF', 'MANAGER', 'ADMIN')`. Bất kỳ Staff nào cũng có thể waive fee. Nên chỉ Manager mới được waive.

### L5. [Workflow] ReopenSession không reset fee exceptions
**File:** `BE/.../service/ParkingSessionServiceImpl.java:387-410`
- **Mô tả:** `reopenSession()` set fee = 0 và checkOutAt = null. Nhưng không xóa các exception records hoặc notes.
- **Hậu quả:** Session reopen nhưng vẫn còn exception history.

---

## 10. LỖI API / DỮ LIỆU

### API1. [BE] ParkingSessionController thiếu API: GET /api/sessions/active/count
- **Mô tả:** Dashboard Staff cần số lượng session đang ACTIVE, nhưng phải query list rồi đếm (FE tự đếm). Nên có API count riêng.

### API2. [BE] Building API chỉ hỗ trợ 1 building (GET/PUT duy nhất)
**File:** `BE/.../controller/BuildingController.java:16`
```java
@RequestMapping("/api/building") // Số ít - chỉ 1 building
```
- **Mô tả:** Chỉ quản lý 1 building. Nhưng FE có interface `Building` với `id: string` (có thể nhiều building). Hệ thống không hỗ trợ multi-building.

### API3. [BE] FloorController thiếu API xóa tầng
**File:** `BE/.../controller/FloorController.java`
- **Mô tả:** CRUD floors, nhưng cần kiểm tra DELETE có cascade xóa slots không.

### API4. [BE] PaymentController không hỗ trợ refund
**File:** `BE/.../controller/PaymentController.java`
- **Mô tả:** Không có API refund/hoàn tiền.

### API5. [FE] `buildingApi.get()` trả về Object, không phải Array
**File:** `FE/src/api/buildingApi.ts`
- **Mô tả:** `buildingApi.get()` trả về `BuildingResponseDto`, không phải array. Nhưng `resourceService.list("buildings")` wrap nó thành array `[building]`. Bất nhất.

---

## TỔNG KẾT

| Mức độ | Số lượng | Mô tả |
|--------|----------|-------|
| **CRITICAL** | 5 | Check-out không gọi API, Pricing Model mismatch |
| **High** | 22+ | Workflow incident bị hỏng, Permission thiếu, Luồng payment sai |
| **Medium** | 10+ | UX kém, thiếu validation, type mismatch |
| **Low** | 8+ | Code style, cache, naming |

**Ghi chú:** Cần ưu tiên xử lý các lỗi CRITICAL trước (C1-C5) vì chúng làm hỏng toàn bộ luồng nghiệp vụ chính của hệ thống.
