/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User, ClubEvent, Attendance, Task, TaskApproval, ScoreHistory,
  RewardRecord, WarningRecord, News, Announcement, Notification, RoleID, DeptID,
  INITIAL_USERS, INITIAL_EVENTS, INITIAL_ATTENDANCE, INITIAL_TASKS,
  INITIAL_TASK_APPROVALS, INITIAL_SCORE_HISTORY, INITIAL_REWARDS,
  INITIAL_WARNINGS, INITIAL_NEWS, INITIAL_ANNOUNCEMENTS, INITIAL_NOTIFICATIONS
} from '../types';

export const KEYS = {
  USERS: 'clb_users',
  EVENTS: 'clb_events',
  ATTENDANCE: 'clb_attendance',
  TASKS: 'clb_tasks',
  APPROVALS: 'clb_approvals',
  HISTORY: 'clb_history',
  REWARDS: 'clb_rewards',
  WARNINGS: 'clb_warnings',
  NEWS: 'clb_news',
  ANNOUNCEMENTS: 'clb_announcements',
  NOTIFICATIONS: 'clb_notifications',
  CURRENT_USER_ID: 'clb_current_user_id'
};

// LocalStorage helpers with fallback to initial static datasets
export function getSavedData<T>(key: string, defaultValue: T): T {
  // If database is not initialized yet in localStorage, initialize it synchronously
  if (typeof window !== 'undefined' && !localStorage.getItem(KEYS.USERS)) {
    initializeDatabase();
  }
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing localStorage for key", key, e);
    }
  }
  return defaultValue;
}

export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initializeDatabase(): void {
  if (!localStorage.getItem(KEYS.USERS)) saveToStorage(KEYS.USERS, INITIAL_USERS);
  if (!localStorage.getItem(KEYS.EVENTS)) saveToStorage(KEYS.EVENTS, INITIAL_EVENTS);
  if (!localStorage.getItem(KEYS.ATTENDANCE)) saveToStorage(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  if (!localStorage.getItem(KEYS.TASKS)) saveToStorage(KEYS.TASKS, INITIAL_TASKS);
  
  if (localStorage.getItem(KEYS.APPROVALS)) {
    try {
      const stored = JSON.parse(localStorage.getItem(KEYS.APPROVALS) || '[]');
      if (Array.isArray(stored) && !stored.some((ap: any) => ap.TaskID === 202)) {
        stored.push({
          ApprovalID: 303,
          TaskID: 202,
          EvidenceURL: "https://github.com/baopq/instagram-profile-clb",
          EvidenceComment: "Em đã hoàn thành lập trình giao diện hồ sơ thành viên chuẩn phong cách Instagram, tích hợp điểm số & khen thưởng. Nhờ anh/chị xem xét phê duyệt ạ!",
          Status: 'Pending'
        });
        saveToStorage(KEYS.APPROVALS, stored);
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    saveToStorage(KEYS.APPROVALS, INITIAL_TASK_APPROVALS);
  }

  if (!localStorage.getItem(KEYS.HISTORY)) saveToStorage(KEYS.HISTORY, INITIAL_SCORE_HISTORY);
  if (!localStorage.getItem(KEYS.REWARDS)) saveToStorage(KEYS.REWARDS, INITIAL_REWARDS);
  if (!localStorage.getItem(KEYS.WARNINGS)) saveToStorage(KEYS.WARNINGS, INITIAL_WARNINGS);
  if (!localStorage.getItem(KEYS.NEWS)) saveToStorage(KEYS.NEWS, INITIAL_NEWS);
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) saveToStorage(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) saveToStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (!localStorage.getItem(KEYS.CURRENT_USER_ID)) localStorage.setItem(KEYS.CURRENT_USER_ID, "4"); // Default Member: Phạm Quốc Bảo
}

// Recalculates Levels based on TotalScore
export function getLevelName(score: number): string {
  if (score >= 200) return "Kim Cương";
  if (score >= 120) return "Bạch Kim";
  if (score >= 80) return "Vàng";
  if (score >= 40) return "Bạc";
  return "Đồng";
}

// 2.8.1 Automated Scheduler logic
export interface SchedulerResult {
  notificationsAdded: number;
  warningsAdded: number;
  warningsResolved: number;
  rewardsAdded: number;
  logs: string[];
}

export function runAutomatedScheduler(
  users: User[],
  attendance: Attendance[],
  warnings: WarningRecord[],
  rewards: RewardRecord[],
  notifications: Notification[]
): {
  updatedUsers: User[];
  updatedWarnings: WarningRecord[];
  updatedRewards: RewardRecord[];
  updatedNotifications: Notification[];
  result: SchedulerResult;
} {
  const resultLogs: string[] = [];
  let notificsCount = 0;
  let warnCount = 0;
  let resolvedWarns = 0;
  let rewardCount = 0;

  const newWarnings = [...warnings];
  const newRewards = [...rewards];
  const newNotifications = [...notifications];
  
  const updatedUsers = users.map(user => {
    const userCopy = { ...user };
    const userScore = userCopy.TotalScore;

    // Condition 1: Warn level 1 (Score < 80)
    if (userScore < 80 && userScore >= 30) {
      const idx = newWarnings.findIndex(w => w.UserID === userCopy.UserID && w.WarningLevel === 'Mức 1' && w.Status === 'Active');
      if (idx === -1) {
        newWarnings.push({
          WarningID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          WarningLevel: 'Mức 1',
          Reason: `Hệ thống tự động: Tổng điểm (${userScore}) giảm dưới 80.`,
          CreatedDate: new Date().toISOString().split('T')[0],
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Status: 'Active'
        });
        newNotifications.push({
          NotificationID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          Title: "Cảnh báo tự động Mức 1",
          Content: "Mức điểm của bạn đang dưới 80. Hệ thống đề xuất tăng cường tham gia thêm các hoạt động CLB.",
          Type: 'Warning',
          CreatedDate: new Date().toISOString(),
          IsRead: false
        });
        notificsCount++;
        warnCount++;
        resultLogs.push(`Thành viên ${userCopy.FullName}: Cảnh báo tự động Mức 1 do điểm số < 80.`);
      }
    }

    // Condition 2: Warn Level 3 (Score < 30)
    if (userScore < 30) {
      const idx = newWarnings.findIndex(w => w.UserID === userCopy.UserID && w.WarningLevel === 'Mức 3' && w.Status === 'Active');
      if (idx === -1) {
        newWarnings.push({
          WarningID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          WarningLevel: 'Mức 3',
          Reason: `Ý kiến Ban Chủ nhiệm: Tổng điểm nguy cơ (${userScore}) dưới 30.`,
          CreatedDate: new Date().toISOString().split('T')[0],
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Status: 'Active'
        });
        newNotifications.push({
          NotificationID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          Title: "Đặc biệt chú ý: Cảnh báo Mức 3",
          Content: "Điểm CLB của bạn đang dưới 30. Đề nghị trao đổi gấp với Trưởng ban hoặc Ban Chủ nhiệm để xem xét tư cách thành viên.",
          Type: 'Warning',
          CreatedDate: new Date().toISOString(),
          IsRead: false
        });
        notificsCount++;
        warnCount++;
        resultLogs.push(`Thành viên ${userCopy.FullName}: Đặc biệt chú ý: Cảnh báo Mức 3 do điểm số < 30.`);
      }
    }

    // Condition 3: Resolved warnings if scores get back above limits
    if (userScore >= 80) {
      const activeWarnings = newWarnings.filter(w => w.UserID === userCopy.UserID && w.Status === 'Active');
      activeWarnings.forEach(w => {
        w.Status = 'Resolved';
        resolvedWarns++;
        newNotifications.push({
          NotificationID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          Title: "Gỡ cảnh báo vi phạm thôi thúc",
          Content: `Cảnh báo ${w.WarningLevel} của bạn đã được chuyển sang Trạng thái Khắc phục thành công (Resolved) vì điểm đã tăng lên ${userScore}.`,
          Type: 'System',
          CreatedDate: new Date().toISOString(),
          IsRead: false
        });
        notificsCount++;
        resultLogs.push(`Gỡ cảnh báo của ${userCopy.FullName} do đạt mốc điểm an toàn (${userScore}).`);
      });
    }

    // Condition 4: Vắng từ 3 buổi liên tiếp (Level 2 Warn)
    // We can simulate an automated scan of attendance
    const userAttendance = attendance.filter(a => a.UserID === userCopy.UserID).slice(-3);
    const absentCount = userAttendance.filter(a => a.Status === 'Absent' || a.Status === 'Late').length; 
    // If user missed most of their recent events
    if (userAttendance.length >= 2 && userAttendance.every(a => a.Status === 'Absent')) {
      const idx = newWarnings.findIndex(w => w.UserID === userCopy.UserID && w.WarningLevel === 'Mức 2' && w.Status === 'Active');
      if (idx === -1) {
        newWarnings.push({
          WarningID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          WarningLevel: 'Mức 2',
          Reason: "Vắng họp CLB liên tục không lý do chính đáng.",
          CreatedDate: new Date().toISOString().split('T')[0],
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Status: 'Active'
        });
        newNotifications.push({
          NotificationID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          Title: "Cảnh báo vắng sinh hoạt định kỳ (Mức 2)",
          Content: "Bạn đang có nguy cơ bị đánh giá không tích cực do liên tục vắng họp.",
          Type: 'Warning',
          CreatedDate: new Date().toISOString(),
          IsRead: false
        });
        notificsCount++;
        warnCount++;
        resultLogs.push(`Thành viên ${userCopy.FullName}: Cảnh báo Mức 2 do vắng liên tiếp tất cả các buổi gần nhất.`);
      }
    }

    // Condition 5: Rewards (Total score >= 200)
    if (userScore >= 200) {
      const rIdx = newRewards.findIndex(r => r.UserID === userCopy.UserID && r.RewardType === 'Thành viên xuất sắc');
      if (rIdx === -1) {
        newRewards.push({
          RewardID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          RewardType: 'Thành viên xuất sắc',
          AwardDate: new Date().toISOString().split('T')[0],
          Reason: `Tổng điểm tích lũy vượt trội đạt ${userScore} điểm.`
        });
        newNotifications.push({
          NotificationID: Date.now() + Math.random(),
          UserID: userCopy.UserID,
          Title: "Vinh danh: Thành viên xuất sắc",
          Content: `Chúc mừng bạn đã đạt dải điểm ${userScore} và chính thức nhận danh hiệu Thành viên xuất sắc!`,
          Type: 'Reward',
          CreatedDate: new Date().toISOString(),
          IsRead: false
        });
        notificsCount++;
        rewardCount++;
        resultLogs.push(`Vinh danh ${userCopy.FullName}: Trở thành Thành viên xuất sắc với ${userScore}đ!`);
      }
    }

    // Adjust user Level
    userCopy.CurrentLevel = getLevelName(userCopy.TotalScore);

    return userCopy;
  });

  if (resultLogs.length === 0) {
    resultLogs.push("Hệ thống quét xong. Không phát hiện sự cố, điểm số thành viên đều ổn định.");
  }

  return {
    updatedUsers,
    updatedWarnings: newWarnings,
    updatedRewards: newRewards,
    updatedNotifications: newNotifications,
    result: {
      notificationsAdded: notificsCount,
      warningsAdded: warnCount,
      warningsResolved: resolvedWarns,
      rewardsAdded: rewardCount,
      logs: resultLogs
    }
  };
}
