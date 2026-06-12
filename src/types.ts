/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RoleID {
  MEMBER = 1,
  ADMIN = 2,
  SUPER_ADMIN = 3
}

export enum DeptID {
  TRUYEN_THONG = 1,
  KY_THUAT = 2,
  NHAN_SU = 3,
  SU_KIEN = 4
}

export interface Role {
  RoleID: RoleID;
  RoleName: string;
}

export interface Department {
  DepartmentID: DeptID;
  DepartmentName: string;
}

export interface User {
  UserID: number;
  StudentCode: string;
  FullName: string;
  Email: string;
  Phone: string;
  DepartmentID: DeptID;
  RoleID: RoleID;
  TotalScore: number;
  CurrentLevel: string; // e.g. "Bạch Kim", "Vàng", "Bạc", "Đồng"
  Status: 'Active' | 'Inactive';
  CreatedDate: string;
  Avatar: string;
  Cover?: string;
  Password?: string;
}

export interface RegisterRequest {
  RequestID: number;
  StudentCode: string;
  FullName: string;
  Email: string;
  Phone: string;
  Password?: string;
  DepartmentID: DeptID;
  CreatedDate: string;
  Status: 'Pending' | 'Approved' | 'Rejected';
  RejectReason?: string;
}

export interface ClubEvent {
  EventID: number;
  EventName: string;
  EventDate: string;
  Location: string;
  Description: string;
  CreatedBy: number;
  QRCodeUrl: string; // Generated string representation for mock check-in
}

export interface Attendance {
  AttendanceID: number;
  UserID: number;
  EventID: number;
  Status: 'Present' | 'Late' | 'Absent' | 'Excused';
  CheckInTime?: string;
}

export interface Task {
  TaskID: number;
  TaskName: string;
  Description: string;
  AssignedBy: number; // UserID of Creator
  AssignedTo: number; // UserID of Assignee
  Deadline: string;
  Status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected' | 'Overdue';
}

export interface TaskApproval {
  ApprovalID: number;
  TaskID: number;
  EvidenceURL: string;
  EvidenceComment?: string;
  ApprovedBy?: number; // UserID of Admin
  ApprovedDate?: string;
  Status: 'Pending' | 'Approved' | 'Rejected';
  Comment?: string;
}

export interface ScoreHistory {
  ScoreID: number;
  UserID: number;
  ScoreChange: number;
  Reason: string;
  ReferenceType: 'Task' | 'Event' | 'Manual' | 'System';
  ReferenceID?: number;
  CreatedBy: number;
  CreatedDate: string;
}

export interface RewardRecord {
  RewardID: number;
  UserID: number;
  RewardType: 'Thành viên xuất sắc' | 'Thành viên tích cực' | 'Thành viên chuyên cần' | 'Cống hiến nổi bật';
  AwardDate: string;
  Reason: string;
}

export interface WarningRecord {
  WarningID: number;
  UserID: number;
  WarningLevel: 'Mức 1' | 'Mức 2' | 'Mức 3';
  Reason: string;
  CreatedDate: string;
  ExpiryDate: string;
  Status: 'Active' | 'Resolved' | 'Expired';
}

export interface News {
  NewsID: number;
  Title: string;
  Content: string;
  AuthorID: number; // UserID
  CreatedDate: string;
  ImageURL: string;
  Likes: number;
  LikedBy: number[]; // UserIDs who liked
  Comments: { id: number; userName: string; text: string; date: string }[];
}

export interface Announcement {
  AnnouncementID: number;
  Title: string;
  Content: string;
  AuthorID: number; // UserID
  CreatedDate: string;
  ExpiredDate: string;
}

export interface Notification {
  NotificationID: number;
  UserID: number;
  Title: string;
  Content: string;
  Type: 'Score' | 'Task' | 'Event' | 'Warning' | 'Reward' | 'System';
  CreatedDate: string;
  IsRead: boolean;
}

// Fixed roles
export const ROLES: Role[] = [
  { RoleID: RoleID.MEMBER, RoleName: 'Thành viên' },
  { RoleID: RoleID.ADMIN, RoleName: 'Trưởng ban / Phó ban' },
  { RoleID: RoleID.SUPER_ADMIN, RoleName: 'Super Admin - Chủ nhiệm' }
];

// Fixed departments
export const DEPARTMENTS: Department[] = [
  { DepartmentID: DeptID.TRUYEN_THONG, DepartmentName: 'Ban Truyền thông & Đối ngoại' },
  { DepartmentID: DeptID.KY_THUAT, DepartmentName: 'Ban Kỹ thuật & Công nghệ' },
  { DepartmentID: DeptID.NHAN_SU, DepartmentName: 'Ban Nhân sự & Đào tạo' },
  { DepartmentID: DeptID.SU_KIEN, DepartmentName: 'Ban Tổ chức Sự kiện & Đối nội' }
];

// High-quality photos from Unsplash for Instagram-style presentation
export const INITIAL_USERS: User[] = [
  {
    UserID: 1,
    StudentCode: "HE180123",
    FullName: "Nguyễn Tuấn Anh",
    Email: "tuananh77zt@gmail.com",
    Phone: "0912345678",
    DepartmentID: DeptID.KY_THUAT,
    RoleID: RoleID.SUPER_ADMIN,
    TotalScore: 245,
    CurrentLevel: "Kim Cương",
    Status: 'Active',
    CreatedDate: "2025-09-10",
    Avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    Password: "123456"
  },
  {
    UserID: 2,
    StudentCode: "HE180456",
    FullName: "Lê Minh Tuấn",
    Email: "tuanlm@clb.vn",
    Phone: "0987654321",
    DepartmentID: DeptID.SU_KIEN,
    RoleID: RoleID.ADMIN,
    TotalScore: 190,
    CurrentLevel: "Vàng",
    Status: 'Active',
    CreatedDate: "2025-09-12",
    Avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    Password: "123456"
  },
  {
    UserID: 3,
    StudentCode: "HE180789",
    FullName: "Trần Thị Lan Hương",
    Email: "huongttl@clb.vn",
    Phone: "0934567890",
    DepartmentID: DeptID.TRUYEN_THONG,
    RoleID: RoleID.ADMIN,
    TotalScore: 175,
    CurrentLevel: "Vàng",
    Status: 'Active',
    CreatedDate: "2025-09-15",
    Avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    Password: "123456"
  },
  {
    UserID: 4,
    StudentCode: "HE180999",
    FullName: "Phạm Quốc Bảo",
    Email: "baopq@clb.vn",
    Phone: "0955556666",
    DepartmentID: DeptID.KY_THUAT,
    RoleID: RoleID.MEMBER,
    TotalScore: 95,
    CurrentLevel: "Bạc",
    Status: 'Active',
    CreatedDate: "2025-10-01",
    Avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    Password: "123456"
  },
  {
    UserID: 5,
    StudentCode: "HE181111",
    FullName: "Hoàng Ngọc Mai",
    Email: "maihn@clb.vn",
    Phone: "0977778888",
    DepartmentID: DeptID.NHAN_SU,
    RoleID: RoleID.MEMBER,
    TotalScore: 78, // < 80, will trigger Warn Level 1
    CurrentLevel: "Đồng",
    Status: 'Active',
    CreatedDate: "2025-10-05",
    Avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    Password: "123456"
  },
  {
    UserID: 6,
    StudentCode: "HE182222",
    FullName: "Vũ Hải Đăng",
    Email: "dangvh@clb.vn",
    Phone: "0966667777",
    DepartmentID: DeptID.SU_KIEN,
    RoleID: RoleID.MEMBER,
    TotalScore: 25, // < 30, triggers Warn Level 3 (high alert)
    CurrentLevel: "Đồng",
    Status: 'Active',
    CreatedDate: "2025-10-10",
    Avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    Password: "123456"
  }
];

export const INITIAL_EVENTS: ClubEvent[] = [
  {
    EventID: 101,
    EventName: "Họp Định Kỳ CLB - Tháng 6",
    EventDate: "2026-06-05T19:30:00",
    Location: "Phòng họp Hội trường 301, Tòa tháp Alpha",
    Description: "Sinh hoạt định kỳ CLB để đánh giá hiệu suất, thảo luận chiến dịch tuyển thành viên mới và triển khai kế hoạch tiếp theo.",
    CreatedBy: 1,
    QRCodeUrl: "attendance_event_101_secret"
  },
  {
    EventID: 102,
    EventName: "Workshop UI/UX Instagram Minimalist Design",
    EventDate: "2026-06-12T14:00:00",
    Location: "Phòng Lab 402 & Trực tuyến qua Google Meet",
    Description: "Chia sẻ chuyên sâu về tối giản hóa giao diện lấy cảm ứng từ kiến trúc Instagram, tối ưu bối cảnh bảng tin và hồ sơ.",
    CreatedBy: 1,
    QRCodeUrl: "attendance_event_102_secret"
  }
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  { AttendanceID: 1, UserID: 4, EventID: 101, Status: 'Present', CheckInTime: "2026-06-05T19:25:12" },
  { AttendanceID: 2, UserID: 5, EventID: 101, Status: 'Late', CheckInTime: "2026-06-05T19:42:00" },
  { AttendanceID: 3, UserID: 6, EventID: 101, Status: 'Absent' },
  { AttendanceID: 4, UserID: 2, EventID: 101, Status: 'Present', CheckInTime: "2026-06-05T19:15:00" },
  { AttendanceID: 5, UserID: 3, EventID: 101, Status: 'Present', CheckInTime: "2026-06-05T19:20:00" },
];

export const INITIAL_TASKS: Task[] = [
  {
    TaskID: 201,
    TaskName: "Thiết kế Banner Sự Kiện UI/UX",
    Description: "Thiết kế banner sự kiện kích thước 16:9 và Avatar Profile truyền thông cho Workshop ngày 12/06.",
    AssignedBy: 3,
    AssignedTo: 5,
    Deadline: "2026-06-10",
    Status: 'Completed'
  },
  {
    TaskID: 202,
    TaskName: "Lập trình Trang Hồ Sơ Thành Viên",
    Description: "Phát triển component Profile giống Instagram, bổ sung tab Điểm số, Thẻ thành viên, và Khen thưởng.",
    AssignedBy: 1,
    AssignedTo: 4,
    Deadline: "2026-06-15",
    Status: 'In Progress'
  },
  {
    TaskID: 203,
    TaskName: "Chuẩn bị Teabreak & Set up Phòng họp",
    Description: "Đặt bánh ngọt, hoa quả và chuẩn bị máy chiếu cho sự họp định kỳ CLB.",
    AssignedBy: 2,
    AssignedTo: 6,
    Deadline: "2026-06-05",
    Status: 'Rejected' // Unfinished or failed
  },
  {
    TaskID: 204,
    TaskName: "Viết kịch bản MC & MC Script cho Workshop",
    Description: "Lên dàn bài, kịch bản dẫn chương trình đầy đủ cho MC chính và phụ.",
    AssignedBy: 3,
    AssignedTo: 5,
    Deadline: "2026-06-11",
    Status: 'Pending'
  }
];

export const INITIAL_TASK_APPROVALS: TaskApproval[] = [
  {
    ApprovalID: 301,
    TaskID: 201,
    EvidenceURL: "https://drive.google.com/file/d/banner_design_final/view",
    EvidenceComment: "Đã hoàn thành thiết kế bản mộc và xuất file chất lượng cao gửi anh/chị truyền thông duyệt.",
    ApprovedBy: 3,
    ApprovedDate: "2026-06-10T18:30:11",
    Status: 'Approved',
    Comment: "Thiết kế rất xuất sắc, đúng tinh thần Instagram tối giản. Điểm cộng cho sự sáng tạo!"
  },
  {
    ApprovalID: 302,
    TaskID: 203,
    EvidenceURL: "https://drive.google.com/file/d/evidence_teabreak_failed",
    EvidenceComment: "Em bận thi cuối kỳ đột xuất nên không kịp chuẩn bị gì cả, mong ban chủ nhiệm thông cảm ạ.",
    ApprovedBy: 2,
    ApprovedDate: "2026-06-05T21:00:00",
    Status: 'Rejected',
    Comment: "Cần báo trước ít nhất 1 ngày nếu không tham gia chuẩn bị. Trừ điểm vi phạm nội quy."
  },
  {
    ApprovalID: 303,
    TaskID: 202,
    EvidenceURL: "https://github.com/baopq/instagram-profile-clb",
    EvidenceComment: "Em đã hoàn thành lập trình giao diện hồ sơ thành viên chuẩn phong cách Instagram, tích hợp điểm số & khen thưởng. Nhờ anh/chị xem xét phê duyệt ạ!",
    Status: 'Pending'
  }
];

export const INITIAL_SCORE_HISTORY: ScoreHistory[] = [
  { ScoreID: 501, UserID: 4, ScoreChange: 5, Reason: "Tham gia họp định kỳ đầy đủ", ReferenceType: "Event", ReferenceID: 101, CreatedBy: 1, CreatedDate: "2026-06-05T20:00:00" },
  { ScoreID: 502, UserID: 5, ScoreChange: 5, Reason: "Tham gia họp định kỳ", ReferenceType: "Event", ReferenceID: 101, CreatedBy: 1, CreatedDate: "2026-06-05T20:00:00" },
  { ScoreID: 503, UserID: 5, ScoreChange: -5, Reason: "Đi muộn họp Định kỳ (Trễ 12p)", ReferenceType: "Event", ReferenceID: 101, CreatedBy: 1, CreatedDate: "2026-06-05T20:00:00" },
  { ScoreID: 504, UserID: 6, ScoreChange: -5, Reason: "Vắng không phép họp định kỳ tháng 6", ReferenceType: "Event", ReferenceID: 101, CreatedBy: 1, CreatedDate: "2026-06-05T20:00:00" },
  { ScoreID: 505, UserID: 5, ScoreChange: 15, Reason: "Hoàn thành xuất sắc thiết kế Banner Sự Kiện UI/UX (Task #201)", ReferenceType: "Task", ReferenceID: 201, CreatedBy: 3, CreatedDate: "2026-06-10T18:30:11" },
  { ScoreID: 506, UserID: 6, ScoreChange: -10, Reason: "Không hoàn thành nhiệm vụ Teabreak & Phòng họp (Task #203)", ReferenceType: "Task", ReferenceID: 203, CreatedBy: 2, CreatedDate: "2026-06-05T21:00:00" },
];

export const INITIAL_REWARDS: RewardRecord[] = [
  { RewardID: 601, UserID: 1, RewardType: "Thành viên xuất sắc", AwardDate: "2026-05-31", Reason: "Tổng điểm đạt kỷ lục CLB và xuất sắc dẫn dắt ban kỹ thuật phát triển platform." },
  { RewardID: 602, UserID: 2, RewardType: "Thành viên tích cực", AwardDate: "2026-05-31", Reason: "Hoàn thành 100% tất cả các task chuẩn bị sự kiện sinh nhật CLB." }
];

export const INITIAL_WARNINGS: WarningRecord[] = [
  { WarningID: 701, UserID: 5, WarningLevel: "Mức 1", Reason: "Cập nhật định kỳ: Tổng điểm dưới 80 ngày 11/06.", CreatedDate: "2026-06-11", ExpiryDate: "2026-07-11", Status: 'Active' },
  { WarningID: 702, UserID: 6, WarningLevel: "Mức 3", Reason: "Tổng điểm dưới 30 và vắng bóng họp không phép liên tiếp.", CreatedDate: "2026-06-05", ExpiryDate: "2026-07-05", Status: 'Active' }
];

export const INITIAL_NEWS: News[] = [
  {
    NewsID: 801,
    Title: "WORKSHOP KÝ THUẬT: PHÁT TRIỂN WEB HOÀN HẢO GIAO DIỆN INSTAGRAM",
    Content: "Đừng bỏ lỡ buổi Workshop siêu hót tối mai do Ban Kỹ thuật tổ chức. Chúng ta sẽ cùng code giao diện siêu đỉnh lấy cảm hứng hoàn toàn từ mạng xã hội Instagram. Hứa hẹn cực kỳ bùng nổ, có đồ ăn nhẹ miễn phí cực chill!",
    AuthorID: 1,
    CreatedDate: "2026-06-11T10:00:00",
    ImageURL: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    Likes: 14,
    LikedBy: [2, 3, 4],
    Comments: [
      { id: 1, userName: "huongttl", text: "Team truyền thông đã lên bài seeding khắp trường rồi ạ! 🥰", date: "2026-06-11T10:15:00" },
      { id: 2, userName: "baopq", text: "Vừa tối giản vừa chất chơi, múp quá anh ơi!", date: "2026-06-11T10:30:00" }
    ]
  },
  {
    NewsID: 802,
    Title: "TỔNG KẾT ĐỢT SINH HOẠT THÁNG 5 & VINH DANH CÁC BAN CHĂM CHỈ",
    Content: "Chúc mừng Ban Sự Kiện đã hoàn thành xuất sắc chuỗi trò chơi gắn kết nội bộ vừa qua. CLB xin trân trọng cảm ơn tất cả các thành viên đã nhiệt huyết đóng góp sức trẻ của mình. Hãy thả tim cho sự cố gắng không ngừng nghỉ này nhé!",
    AuthorID: 2,
    CreatedDate: "2026-05-30T16:00:00",
    ImageURL: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80",
    Likes: 28,
    LikedBy: [1, 4, 5, 6],
    Comments: []
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    AnnouncementID: 901,
    Title: "LỊCH ĐIỂM DANH WORKSHOP TUẦN NÀY (BẮT BUỘC)",
    Content: "Tất cả các thành viên lưu ý lịch Workshop ngày 12/06 bế mạc kỳ 1, vui lòng tham gia đúng giờ đầy đủ. Mã QR điểm danh sẽ được bật lúc 14:00 và khóa sau 15 phút. Toàn bộ thông tin sẽ cập nhật thẳng vào TotalScore.",
    AuthorID: 1,
    CreatedDate: "2026-06-10",
    ExpiredDate: "2026-06-13"
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { NotificationID: 1001, UserID: 1, Title: "Nhiệm vụ mới được nộp", Content: "Phạm Quốc Bảo đã nộp minh chứng cho nhiệm vụ 'Lập trình Trang Hồ Sơ Thành Viên'. Hãy kiểm tra phê duyệt.", Type: "Task", CreatedDate: "2026-06-11T09:00:00", IsRead: false },
  { NotificationID: 1002, UserID: 5, Title: "Cảnh báo cấp độ 1", Content: "Hệ thống tự động phát cảnh báo Mức 1: Bạn có điểm số thấp hơn 80. Tham gia nhiều hoạt động CLB hơn.", Type: "Warning", CreatedDate: "2026-06-11T23:00:00", IsRead: false },
  { NotificationID: 1003, UserID: 4, Title: "Cộng điểm hoạt động", Content: "Bạn được cộng +5 điểm vì tham gia họp định kỳ đầy đủ.", Type: "Score", CreatedDate: "2026-06-05T20:00:00", IsRead: true }
];
