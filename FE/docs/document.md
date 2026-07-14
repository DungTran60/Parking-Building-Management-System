Business Requirement & WORKFLOW
1. Tổng quan Role
| Role                  | Vai trò chính        | Mục tiêu |
|-----------------------|----------------------|----------|
| System Administrator  | Quản   trị hệ thống  | Quản lý tài khoản, phân quyền, cấu hình hệ thống |
| Parking Manager       | Quản lý vận hành     | Quản lý thông tin tòa nhà, giá, slot, báo cáo, sự cố |
| Parking Staff         | Nhân viên vận hành   | Xử lý xe vào/ra, thanh toán, sự cố |
| Parking User / Driver | Người gửi xe         | Xem thông tin, đặt chỗ, gửi xe, thanh toán, phản hồi |

2. Mapping chức năng theo Role
| Chức năng                      | Admin | Manager        | Staff               | Driver       |
|--------------------------------|:-----:|----------------|---------------------|--------------|
| Đăng nhập                      | ✔     | ✔              | ✔                   | ✔            |
| Đăng ký tài khoản              | ✖     | ✖              | ✖                   | ✔            |
| Quản lý tài khoản              | ✔     | ✖              | ✖                   | ✖            |
| Phân quyền                     | ✔     | ✖              | ✖                   | ✖            |
| Quản lý thông tin tòa nhà      | ✖     | ✔              | ✖                   | Xem          |
| Quản lý loại phương tiện       | ✖     | ✔              | ✖                   | Xem          |
| Quản lý tầng/khu vực           | ✖     | ✔              | ✖                   | Xem          |
| Quản lý slot                   | ✖     | ✔              | ✖                   | Xem          |
| Cập nhật trạng thái slot       | ✖     | Giám sát       | ✔                   | Xem          |
| Quản lý bảng giá               | ✖     | ✔              | ✖                   | Xem          |
| Tạo lượt gửi xe                | ✖     | Giám sát       | ✔                   | Nhận mã      |
| Check-in xe                    | ✖     | Giám sát       | ✔                   | Cung cấp xe  |
| Check-out xe                   | ✖     | Giám sát       | ✔                   | Thanh toán   |
| Đặt chỗ trước                  | ✖     | Xem/Giám sát   | Hỗ trợ check-in     | ✔            |
| Tạo sự cố/phản hồi             | ✖     | ✖              | ✔                   | ✔            |
| Phân công sự cố                | ✖     | ✔              | ✖                   | ✖            |
| Xử lý sự cố                    | ✖     | Giám sát       | ✔                   | ✖            |
| Xem báo cáo                    | ✖     | ✔              | ✖                   | ✖            |
| Cấu hình hệ thống              | ✔     | ✖              | ✖                   | ✖            |

3. Workflow tổng thể
### 3.1
Admin

↓

Tạo tài khoản Manager

↓

Manager đăng nhập

↓

Cập nhật thông tin tòa nhà

↓

Tạo loại xe

↓

Tạo tầng

↓

Tạo slot

↓

Thiết lập bảng giá

↓

Staff bắt đầu vận hành

↓

Driver sử dụng dịch vụ
### 3.2 
Driver truy cập website
↓
Xem thông tin tòa nhà / bảng giá / slot trống
↓
Driver có thể đặt chỗ trước hoặc đến gửi trực tiếp
↓
Staff xử lý xe vào bãi
↓
Hệ thống tạo Parking Session
↓
Staff hướng dẫn xe vào slot phù hợp
↓
Driver gửi xe
↓
Driver lấy xe
↓
Staff xử lý check-out và tính phí
↓
Driver thanh toán
↓
Hệ thống đóng session, giải phóng slot
↓
Manager xem báo cáo vận hành và doanh thu
↓
Admin quản lý tài khoản, phân quyền, cấu hình hệ thống

4. Chi tiết từng Role
### 4.1 System Administrator
Chức năng
Nhóm chức năng	Mô tả
Quản lý tài khoản	Tạo, sửa, khóa, mở tài khoản
Phân quyền	Gán role Admin, Manager, Staff, Driver
Cấu hình hệ thống	Cấu hình thông tin hệ thống (ví dụ: Password Policy, Session Timeout, Tên hệ thống, Logo, Phiên bản, Màu giao diện (optional), Timezone, Định dạng ngày giờ)
Theo dõi bảo mật	Kiểm soát đăng nhập, tài khoản bị khóa
1. Workflow Admin
Admin đăng nhập
↓
Vào User Management
↓
Tạo hoặc cập nhật tài khoản
↓
Gán role phù hợp
↓
Lưu thay đổi
↓
Người dùng sử dụng hệ thống theo quyền được cấp
*** Mapping với role khác ***
Admin thao tác	Ảnh hưởng tới role
Tạo tài khoản Staff	Staff có thể đăng nhập và xử lý xe
Tạo tài khoản Manager	Manager có thể quản lý tòa nhà
Khóa tài khoản Driver	Driver không thể đặt chỗ hoặc xem lịch sử
Gán sai quyền	Có thể gây lỗi nghiệp vụ hoặc rủi ro bảo mật

### 4.2 Parking Manager
Chức năng
Nhóm chức năng	Mô tả
Quản lý thông tin tòa nhà	Cập nhật thông tin của tòa nhà hiện tại (Ví dụ: Tên tòa nhà, Địa chỉ, Hotline, Email, Mô tả, Giờ hoạt động, 
Nội quy gửi xe, Ảnh đại diện)
Quản lý loại phương tiện	Thêm, sửa, xóa, bật/tắt loại xe (mã code, tên, mô tả, trạng thái Active/Inactive). Ví dụ: Xe máy (MOTORBIKE), Ô tô (CAR)
Quản lý tầng/khu vực	Tầng nào dành cho loại xe nào
Quản lý slot	Thêm, sửa, khóa, bảo trì slot
Quản lý bảng giá	Thiết lập phí theo loại xe
Báo cáo	Doanh thu, lượt xe, tỷ lệ lấp đầy
Quản lý sự cố	Phân công Staff, xác nhận đóng sự cố
1. Workflow Manager cấu hình tòa nhà
Manager đăng nhập
↓
Cập nhật thông tin tòa nhà
↓
Cấu hình loại phương tiện
↓
Cấu hình tầng/khu vực
↓
Tạo danh sách slot
↓
Thiết lập bảng giá
↓
Hệ thống sẵn sàng cho Staff vận hành
2. Workflow Manager xử lý sự cố
Driver/Staff tạo sự cố
↓
Manager xem danh sách sự cố OPEN
↓
Manager phân công Staff xử lý
↓
Staff cập nhật IN_PROGRESS
↓
Staff xử lý xong và chuyển RESOLVED
↓
Manager kiểm tra
↓
Manager đóng sự cố CLOSED
*** Mapping với role khác ***
Manager thao tác	Ảnh hưởng tới role
Cập nhật bảng giá	Staff checkout sẽ tính phí theo giá mới
Khóa slot bảo trì	Staff không thể cấp slot đó cho xe
Phân tầng theo loại xe	Driver/Staff chỉ thấy slot phù hợp
Thêm/đổi loại xe	Driver thấy loại xe khi xem bãi/đặt chỗ; Staff chọn loại xe khi check-in; Floor (loại xe hỗ trợ) và Bảng giá cần cấu hình theo loại mới
Ngừng hoạt động loại xe (Inactive)	Loại xe đó ẩn khỏi check-in/đặt chỗ; các lượt gửi cũ vẫn giữ nguyên loại xe
Phân công sự cố	Staff nhận nhiệm vụ xử lý
Xem báo cáo	Đánh giá hiệu quả làm việc của Staff và tình trạng bãi

### 4.3 Parking Staff
Chức năng
Nhóm chức năng	Mô tả
Check-in xe	Nhập biển số, loại xe, tạo lượt gửi xe
Tạo Parking Session	Ghi nhận thời gian vào, slot, mã gửi xe
Check-out xe	Tìm session, xác nhận xe ra
Tính phí	Hệ thống tự tính theo thời gian gửi
Thu phí	Xác nhận thanh toán
Cập nhật slot	Chuyển slot Occupied/Available
Xử lý sự cố	Mất vé, sai biển số, xe quá giờ, gửi sai khu vực
Tạo sự cố Staff có thể chủ động tạo sự cố khi phát hiện vấn đề trong quá trình vận hành (VD: xe quá giờ, gửi sai khu vực, sai biển số phát hiện lúc check-out) — không chỉ xử lý sự cố do Driver gửi.
Xem báo cáo ✖ — Staff không có trang báo cáo riêng. Số liệu vận hành thời gian thực (xe đang gửi, slot còn trống, sự cố đang mở) được theo dõi qua Dashboard theo ca làm việc. Các báo cáo doanh thu / tỷ lệ lấp đầy / lưu lượng đa ngày thuộc về Manager (Staff không được xem).
1. Workflow Staff Check-in
Driver đến cổng vào
↓
Staff nhập biển số và loại xe
↓
Hệ thống kiểm tra biển số này có Parking Session đang ACTIVE hay không
   (mục đích: tránh check-in trùng cho một xe đã có lượt gửi chưa check-out,
   ví dụ do quét/nhập nhầm biển số hoặc lỗi hệ thống trước đó)
↓
Nếu có session active trùng biển số → Staff xử lý ngoại lệ (không cho check-in mới)
↓
Nếu không có session active → Hệ thống tìm slot trống phù hợp
↓
Staff xác nhận check-in
↓
Hệ thống tạo Parking Session mới
↓
Slot chuyển thành OCCUPIED
↓
Hệ thống sinh mã gửi xe
↓
Driver nhận mã và vào bãi
2. Workflow Staff Check-out
Driver đến cổng ra
↓
Staff nhập biển số hoặc mã gửi xe
↓
Hệ thống tìm Parking Session ACTIVE
↓
Hệ thống tính phí
↓
Driver thanh toán
↓
Staff xác nhận thanh toán
↓
Session chuyển COMPLETED
↓
Slot chuyển AVAILABLE
↓
Xe được rời bãi
3. Workflow Staff xử lý sự cố
Sự cố được tạo bởi Driver hoặc Staff
↓
Staff nhận xử lý
↓
Trạng thái chuyển IN_PROGRESS
↓
Staff kiểm tra thông tin session/vehicle/slot
↓
Staff cập nhật kết quả xử lý
↓
Trạng thái chuyển RESOLVED
↓
Manager xác nhận CLOSED
*** Mapping với role khác ***
Staff thao tác	Liên quan role khác
Tạo session	Driver nhận mã gửi xe
Check-out	Driver thanh toán
Xử lý sự cố	Manager giám sát và đóng sự cố
Cập nhật slot	Manager theo dõi trạng thái bãi
Thu phí	Manager xem doanh thu trong báo cáo

### 4.4 Parking User / Driver
Chức năng
Nhóm chức năng	Mô tả
Xem thông tin tòa nhà	Xem thông tin tòa nhà(Manager đã cấu hình)
Xem slot trống	Theo loại xe/khu vực
Đăng ký tài khoản	Tạo tài khoản Driver
Đặt chỗ trước	Giữ slot theo thời gian
Hủy đặt chỗ	Hủy reservation nếu chưa check-in
Gửi xe theo lượt	Đến bãi, Staff tạo session
Theo dõi lượt gửi xe	Xem giờ vào, slot, phí tạm tính
Thanh toán	Thanh toán khi ra bãi
Gửi phản hồi/sự cố	Báo mất vé, sai phí, khó tìm xe
1. Workflow Driver gửi xe trực tiếp
Driver đến bãi
↓
Driver cung cấp biển số/loại xe cho Staff
↓
Staff tạo Parking Session
↓
Driver nhận mã gửi xe
↓
Driver vào đúng khu vực/slot
↓
Driver quay lại lấy xe
↓
Staff tính phí
↓
Driver thanh toán
↓
Driver rời bãi
2. Workflow Driver đặt chỗ trước
Driver đăng nhập
↓
Chọn loại phương tiện
↓
Xem slot/khu vực còn trống
↓
Chọn thời gian dự kiến gửi
↓
Tạo Reservation
↓
Slot chuyển RESERVED
↓
Driver đến bãi
↓
Staff xác nhận reservation
↓
Chuyển Reservation thành Parking Session
3. Workflow Driver hủy đặt chỗ
Driver đăng nhập
↓
Xem danh sách Reservation của mình
↓
Chọn Reservation trạng thái RESERVED
↓
Hệ thống kiểm tra điều kiện hủy
   (chỉ hủy được khi chưa check-in, tức Reservation vẫn ở trạng thái RESERVED,
   chưa chuyển sang CHECKED_IN)
↓
Driver xác nhận hủy
↓
Hệ thống cập nhật Reservation = CANCELLED
↓
Slot chuyển từ RESERVED → AVAILABLE
↓
Slot có thể được cấp cho Driver khác
4. Workflow hệ thống xử lý Reservation hết hạn (No-show)
Reservation ở trạng thái RESERVED
↓
Hệ thống theo dõi thời gian dự kiến check-in
↓
Quá mốc thời gian cho phép (VD: 15-30 phút sau giờ dự kiến, tùy cấu hình)
↓
Hệ thống tự động chuyển Reservation = EXPIRED
↓
Slot chuyển từ RESERVED → AVAILABLE
↓
(Optional) Hệ thống gửi thông báo cho Driver về việc Reservation đã hết hạn
5. tranh chấp phí" (liên kết với luồng sự cố mục 5.3)
Driver cho rằng phí tính sai
↓
Driver tạo sự cố loại "Sai phí" (mục 4.4/5.3, trạng thái OPEN)
↓
Session chuyển tạm thời sang DISPUTED (giữ nguyên, chưa đóng)
↓
Manager/Staff xử lý sự cố → xác định phí đúng
↓
Sự cố RESOLVED → Session cập nhật phí (nếu cần) → Driver thanh toán lại
↓
Session = COMPLETED
*** Mapping với role khác ***
Driver thao tác	Liên quan role khác
Đăng ký tài khoản	Admin có thể quản lý/khóa
Đặt chỗ	Staff dùng để check-in khi Driver đến
Gửi xe	Staff tạo session
Thanh toán	Staff xác nhận thanh toán
Gửi phản hồi/sự cố	Staff xử lý, Manager xác nhận
Hủy đặt chỗSystem cập nhật lại Slot = AVAILABLE; Staff/Manager thấy slot trống trở lại trong danh sách

5. Mapping workflow chính giữa các role
### 5.1 Luồng gửi xe theo lượt
| Bước | Role    | Hành động                                             | Kết quả                                                                                  |
|------|---------|-------------------------------------------------------|-------------------------------------------------------------------------------------------|
| 1    | Driver  | Đến tòa nhà                                            | Yêu cầu gửi xe                                                                            |
| 2    | Staff   | Nhập biển số, loại xe                                 | Hệ thống kiểm tra                                                                         |
| 3    | System  | Tìm slot trống                                        | Gợi ý slot                                                                                |
| 4    | Staff   | Xác nhận check-in                                     | Tạo Parking Session                                                                       |
| 5    | System  | Cập nhật slot                                         | `Slot = OCCUPIED`                                                                         |
| 6    | Driver  | Nhận mã gửi xe                                        | Xe vào bãi                                                                                |
| 7    | Staff   | Check-out khi xe ra                                   | Tính phí                                                                                  |
| 8    | Driver  | Thanh toán                                            | Thành công → Hoàn tất phí / Thất bại → `Session = PENDING_PAYMENT` / Tranh chấp → `Session = DISPUTED` |
| 9    | System  | Đóng session (chỉ khi thanh toán thành công)          | `Session = COMPLETED`, `Slot = AVAILABLE`                                                 |
| 9a   | System  | (Nhánh lỗi) Giữ session, chờ xử lý                    | `Session = PENDING_PAYMENT` / `Session = DISPUTED`, `Slot` vẫn `OCCUPIED`                |
| 10   | Manager | Xem báo cáo                                           | Theo dõi doanh thu                                                                        |

### 5.2 Luồng đặt chỗ trước
| Bước | Role    | Thực hiện                                                 | Hành động / Kết quả                                 |
|------|---------|------------------------------------------------------------|-----------------------------------------------------|
| 1    | Driver  | Đăng nhập                                                  | Vào hệ thống                                        |
| 2    | Driver  | Chọn loại xe, thời gian                                    | Tìm slot                                            |
| 3    | System  | Tìm slot trống theo loại xe/thời gian                      | Hiển thị slot khả dụng                              |
| 4    | Driver  | Xác nhận đặt chỗ                                           | Tạo Reservation                                     |
| 5    | System  | Cập nhật slot                                              | `Slot = RESERVED`                                   |
| 5a   | Driver  | (Nhánh hủy) Chọn hủy Reservation trước khi check-in        | `Reservation = CANCELLED`                           |
| 5b   | System  | (Nhánh hủy) Giải phóng slot                                | `Slot = RESERVED → AVAILABLE`                       |
| 5c   | System  | (Nhánh no-show) Kiểm tra thời gian chờ vượt ngưỡng cấu hình| `Reservation = EXPIRED`, `Slot = AVAILABLE`         |
| 6    | Driver  | Đến bãi                                                    | Yêu cầu check-in                                    |
| 7    | Staff   | Kiểm tra reservation                                       | Hợp lệ                                              |
| 8    | Staff   | Xác nhận xe vào                                            | Tạo Parking Session                                 |
| 9    | System  | Cập nhật trạng thái                                        | `Reservation = CHECKED_IN`, `Slot = OCCUPIED`       |
| 10   | Manager | Theo dõi báo cáo                                           | Kiểm soát slot đặt trước                            |

### 5.3 Luồng xử lý sự cố
| Bước | Role          | Hành động              | Trạng thái   |
|------|---------------|------------------------|--------------|
| 1    | Driver/Staff  | Tạo sự cố              | `OPEN`       |
| 2    | Manager       | Phân công Staff        | `OPEN`       |
| 3    | Staff         | Nhận xử lý             | `IN_PROGRESS`|
| 4    | Staff         | Cập nhật kết quả       | `RESOLVED`   |
| 5    | Manager       | Xác nhận hoàn tất      | `CLOSED`     |

6. Kết luận phân quyền
Admin = Quản trị người dùng và hệ thống

Manager = Quản lý nghiệp vụ, cấu hình tòa nhà, báo cáo, xác nhận sự cố

Staff = Vận hành trực tiếp tại cổng vào/ra

Driver = Người sử dụng dịch vụ gửi xe

Cách phân chia này hợp lý vì:

Driver không tự tạo lượt gửi xe
Staff không tự cấu hình bảng giá
Manager không xử lý xe vào/ra thường ngày
Admin không tham gia nghiệp vụ gửi xe
