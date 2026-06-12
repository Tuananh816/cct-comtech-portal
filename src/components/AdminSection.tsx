/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, Users, CheckCircle2, XCircle, Award, AlertTriangle, 
  Search, Plus, Minus, Check, Calendar, FileText, Send, UserCheck, 
  HelpCircle, TrendingUp, Link2
 } from 'lucide-react';
import { 
  User, ClubEvent, Attendance, Task, TaskApproval, ScoreHistory, 
  RewardRecord, WarningRecord, Notification, RoleID, DeptID, DEPARTMENTS, ROLES, RegisterRequest
} from '../types';
import { getLevelName } from '../data/store';

interface AdminSectionProps {
  currentUser: User;
  allUsers: User[];
  events: ClubEvent[];
  tasks: Task[];
  approvals: TaskApproval[];
  scoreHistory: ScoreHistory[];
  onUpdateDatabase: (updates: {
    users?: User[];
    events?: ClubEvent[];
    attendance?: Attendance[];
    tasks?: Task[];
    approvals?: TaskApproval[];
    scoreHistory?: ScoreHistory[];
    rewards?: RewardRecord[];
    warnings?: WarningRecord[];
    notifications?: Notification[];
    registerRequests?: RegisterRequest[];
  }) => void;
  onViewUserProfile: (userId: number) => void;
  registerRequests: RegisterRequest[];
}

export default function AdminSection({
  currentUser,
  allUsers,
  events,
  tasks,
  approvals,
  scoreHistory,
  onUpdateDatabase,
  onViewUserProfile,
  registerRequests
}: AdminSectionProps) {
  // Sub-tabs in Admin Section
  const [activeTab, setActiveTab] = useState<'scoring' | 'approvals' | 'attendance' | 'disciplines' | 'registrations'>('scoring');

  // Registration states
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>({});
  const [registrationsQuery, setRegistrationsQuery] = useState('');

  const handleReviewRegistration = (requestId: number, isApproved: boolean) => {
    const request = registerRequests.find(r => r.RequestID === requestId);
    if (!request) {
      showFeedback('error', 'Không tìm thấy đơn yêu cầu đăng ký tương ứng!');
      return;
    }

    // Prepare updated requests list
    const updatedRequests = registerRequests.map(r => {
      if (r.RequestID === requestId) {
        return {
          ...r,
          Status: isApproved ? ('Approved' as const) : ('Rejected' as const),
          RejectReason: isApproved ? undefined : (rejectReasons[requestId]?.trim() || "Rất tiếc hồ sơ đăng ký chưa phù hợp với tiêu chí tuyển sinh của CLB đợt này.")
        };
      }
      return r;
    });

    let updatedUsers = [...allUsers];
    let updatedHistory = [...scoreHistory];

    if (isApproved) {
      // Create user
      const newUserId = Math.max(...allUsers.map(u => u.UserID), 0) + 1;
      const newUser: User = {
        UserID: newUserId,
        StudentCode: request.StudentCode.trim().toUpperCase(),
        FullName: request.FullName,
        Email: request.Email.trim().toLowerCase(),
        Phone: request.Phone.trim(),
        DepartmentID: request.DepartmentID,
        RoleID: RoleID.MEMBER,
        TotalScore: 10, // Initial welcome reward
        CurrentLevel: "Đồng",
        Status: 'Active',
        CreatedDate: new Date().toISOString().split('T')[0],
        Avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`, // Clear neutral avatar
        Password: request.Password
      };

      updatedUsers.push(newUser);

      // Add a score history log for joining
      const newHistoryLog: ScoreHistory = {
        ScoreID: Math.max(...scoreHistory.map(h => h.ScoreID), 0) + 1,
        UserID: newUserId,
        ScoreChange: 10,
        Reason: "Điểm thưởng chào mừng gia nhập đại gia đình CCT-COMTECH!",
        ReferenceType: 'System',
        CreatedBy: currentUser.UserID,
        CreatedDate: new Date().toISOString().split('T')[0]
      };
      updatedHistory.push(newHistoryLog);

      // Trigger standard notifications about new member joining
      const welcomeNotif: Notification = {
        NotificationID: Date.now(),
        UserID: newUserId,
        Title: "Chào mừng đồng đội mới!",
        Content: `Tài khoản portal của bạn đã kích hoạt. Bạn được thưởng nóng 10 điểm khởi hành! Hãy hoàn tất profile để bắt đầu nộp minh chứng nhiệm vụ.`,
        Type: 'Reward',
        IsRead: false,
        CreatedDate: new Date().toISOString()
      };

      onUpdateDatabase({
        users: updatedUsers,
        registerRequests: updatedRequests,
        scoreHistory: updatedHistory,
        notifications: [welcomeNotif]
      });

      showFeedback('success', `Đã duyệt & kích hoạt tài khoản tuyển sinh cho ${request.FullName}!`);
    } else {
      // If rejected, simply update registerRequests and notify them inside the custom inbox
      onUpdateDatabase({
        registerRequests: updatedRequests
      });

      showFeedback('success', `Đã bác bỏ đơn đăng ký & gửi lý do từ chối cho ${request.FullName}.`);
    }
  };

  // Success/Error Feedback Banner
  const [toastFeedback, setToastFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setToastFeedback({ type, message });
    setTimeout(() => {
      setToastFeedback(null);
    }, 4000);
  };

  // Helper resolvers
  const getUserName = (userId: number) => {
    return allUsers.find(u => u.UserID === userId)?.FullName || `Thành viên #${userId}`;
  };

  const getTaskName = (taskId: number) => {
    return tasks.find(t => t.TaskID === taskId)?.TaskName || `Nhiệm vụ #${taskId}`;
  };

  // ----------------------------------------------------
  // SUB-TAB 1: DIRECT SCORING STATE & HANDLERS
  // ----------------------------------------------------
  const [selectedScoringUserId, setSelectedScoringUserId] = useState<number>(
    allUsers.find(u => u.RoleID === RoleID.MEMBER)?.UserID || allUsers[0]?.UserID || 0
  );
  const [scoringValue, setScoringValue] = useState<string>('10');
  const [scoringReason, setScoringReason] = useState<string>('');
  const [scoringType, setScoringType] = useState<'Manual' | 'Event' | 'Task' | 'System'>('Manual');

  const selectedUserNode = allUsers.find(u => u.UserID === selectedScoringUserId);

  const handleDirectScoringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScoringUserId) {
      showFeedback('error', 'Vui lòng chọn thành viên để tích điểm!');
      return;
    }
    const delta = parseInt(scoringValue, 10);
    if (isNaN(delta) || delta === 0) {
      showFeedback('error', 'Số điểm cộng/trừ phải là số khác 0!');
      return;
    }
    if (!scoringReason.trim()) {
      showFeedback('error', 'Vui lòng nhập lý do cộng/trừ điểm để lưu vết minh bạch!');
      return;
    }

    // Process user update
    const targetUser = allUsers.find(u => u.UserID === selectedScoringUserId);
    if (!targetUser) return;

    const newScore = Math.max(0, targetUser.TotalScore + delta);
    const newLevel = getLevelName(newScore);

    const updatedUsers = allUsers.map(u => {
      if (u.UserID === selectedScoringUserId) {
        return {
          ...u,
          TotalScore: newScore,
          CurrentLevel: newLevel
        };
      }
      return u;
    });

    // Append to Score History
    const newHistoryNode: ScoreHistory = {
      ScoreID: Date.now(),
      UserID: selectedScoringUserId,
      ScoreChange: delta,
      Reason: scoringReason,
      ReferenceType: scoringType,
      CreatedBy: currentUser.UserID,
      CreatedDate: new Date().toISOString()
    };

    // Create Notification
    const newNotifNode: Notification = {
      NotificationID: Date.now() + 1,
      UserID: selectedScoringUserId,
      Title: delta > 0 ? `Tích lũy thành công: +${delta} điểm` : `Kiểm sửa điểm số: ${delta} điểm`,
      Content: `Ban điều hành (${currentUser.FullName}) đã điều chỉnh điểm số của bạn. Lý do: ${scoringReason}. Tổng điểm mới: ${newScore}đ.`,
      Type: 'Score',
      CreatedDate: new Date().toISOString(),
      IsRead: false
    };

    onUpdateDatabase({
      users: updatedUsers,
      scoreHistory: [newHistoryNode, ...scoreHistory],
      notifications: [newNotifNode]
    });

    setScoringReason('');
    showFeedback('success', `Đã cập nhật ${delta > 0 ? '+' : ''}${delta} điểm cho thành viên ${targetUser.FullName} thành công!`);
  };

  const applyPresetScoring = (points: number, reason: string, type: 'Manual' | 'Event' | 'Task' | 'System') => {
    setScoringValue(String(points));
    setScoringReason(reason);
    setScoringType(type);
  };


  // ----------------------------------------------------
  // SUB-TAB 2: SUBMISSION EVIDENCE APPROVALS HANDLERS
  // ----------------------------------------------------
  const [approvalComments, setApprovalComments] = useState<{ [id: number]: string }>({});

  const handleReviewSubmission = (approvalId: number, action: 'Approved' | 'Rejected') => {
    const apNode = approvals.find(ap => ap.ApprovalID === approvalId);
    if (!apNode) return;

    const comment = approvalComments[approvalId]?.trim() || '';

    // 1. Update approval record
    const updatedApprovals = approvals.map(ap => {
      if (ap.ApprovalID === approvalId) {
        return {
          ...ap,
          Status: action,
          ApprovedBy: currentUser.UserID,
          ApprovedDate: new Date().toISOString().split('T')[0],
          Comment: comment || (action === 'Approved' ? 'Báo cáo minh chứng hợp lệ.' : 'Minh chứng chưa đạt, cần bổ sung thêm.')
        };
      }
      return ap;
    });

    // 2. Update task status accordingly
    const targetTask = tasks.find(t => t.TaskID === apNode.TaskID);
    const updatedTasks = tasks.map(t => {
      if (t.TaskID === apNode.TaskID) {
        return {
          ...t,
          Status: action === 'Approved' ? 'Completed' : 'Rejected' as any
        };
      }
      return t;
    });

    let updatedUsers = allUsers;
    let addedHistory: ScoreHistory[] = [];
    let addedNotifs: Notification[] = [];

    if (targetTask) {
      const assigneeId = targetTask.AssignedTo;
      const studentNode = allUsers.find(u => u.UserID === assigneeId);

      if (action === 'Approved') {
        const pointReward = 15; // fixed task completion reward
        const newScore = Math.max(0, (studentNode?.TotalScore || 0) + pointReward);
        const newLevel = getLevelName(newScore);

        updatedUsers = allUsers.map(u => {
          if (u.UserID === assigneeId) {
            return { ...u, TotalScore: newScore, CurrentLevel: newLevel };
          }
          return u;
        });

        addedHistory = [{
          ScoreID: Date.now(),
          UserID: assigneeId,
          ScoreChange: pointReward,
          Reason: `Phê duyệt minh chứng nhiệm vụ: ${targetTask.TaskName}`,
          ReferenceType: 'Task',
          ReferenceID: targetTask.TaskID,
          CreatedBy: currentUser.UserID,
          CreatedDate: new Date().toISOString()
        }];

        addedNotifs = [{
          NotificationID: Date.now() + 2,
          UserID: assigneeId,
          Title: `Nhiệm vụ được duyệt thành công! (+${pointReward}đ)`,
          Content: `Trưởng ban (${currentUser.FullName}) đã duyệt báo cáo cho "${targetTask.TaskName}". Nhận thêm ${pointReward} điểm cống hiến.`,
          Type: 'Task',
          CreatedDate: new Date().toISOString(),
          IsRead: false
        }];
      } else {
        // Rejected
        addedNotifs = [{
          NotificationID: Date.now() + 2,
          UserID: assigneeId,
          Title: "Báo cáo bị Từ Chối / Gặp lỗi",
          Content: `Yêu cầu bổ sung dữ liệu cho "${targetTask.TaskName}". Phản hồi từ Ban điều hành: ${comment || 'Linh minh chứng không truy cập được / sai quy tắc.'}`,
          Type: 'Task',
          CreatedDate: new Date().toISOString(),
          IsRead: false
        }];
      }
    }

    onUpdateDatabase({
      approvals: updatedApprovals,
      tasks: updatedTasks,
      users: updatedUsers,
      scoreHistory: addedHistory.length > 0 ? [...addedHistory, ...scoreHistory] : undefined,
      notifications: addedNotifs.length > 0 ? [...addedNotifs] : undefined
    });

    showFeedback('success', `Đã ${action === 'Approved' ? 'phê duyệt thông qua' : 'từ chối phê duyệt'} báo cáo của thành viên.`);
  };


  // ----------------------------------------------------
  // SUB-TAB 3: QUICK ATTENDANCE SCANNER & SCORING
  // ----------------------------------------------------
  const [attendanceEventId, setAttendanceEventId] = useState<number>(events[0]?.EventID || 0);

  const activeEventNode = events.find(e => e.EventID === attendanceEventId);

  const handleCheckInToggle = (userId: number, currentStatus: 'Present' | 'Late' | 'Absent' | 'Excused' | 'None', newStatus: 'Present' | 'Late' | 'Absent' | 'Excused') => {
    if (!attendanceEventId) return;

    // Get all attendance in local storage/global
    const savedAttendance: Attendance[] = JSON.parse(localStorage.getItem('clb_attendance') || '[]');

    // Points weights
    const getWeights = (st: 'Present' | 'Late' | 'Absent' | 'Excused' | 'None') => {
      if (st === 'Present') return 10;
      if (st === 'Late') return 5;
      if (st === 'Absent') return -10;
      return 0; // Excused or None
    };

    const oldPoints = getWeights(currentStatus);
    const newPoints = getWeights(newStatus);
    const pointDiff = newPoints - oldPoints;

    // Find and update or insert check-in record
    let matchIdx = savedAttendance.findIndex(a => a.UserID === userId && a.EventID === attendanceEventId);
    let updatedAttendance = [...savedAttendance];

    if (matchIdx !== -1) {
      updatedAttendance[matchIdx] = {
        ...updatedAttendance[matchIdx],
        Status: newStatus,
        CheckInTime: newStatus === 'Present' || newStatus === 'Late' ? new Date().toISOString() : undefined
      };
    } else {
      updatedAttendance.push({
        AttendanceID: Date.now() + Math.floor(Math.random() * 1000),
        UserID: userId,
        EventID: attendanceEventId,
        Status: newStatus,
        CheckInTime: newStatus === 'Present' || newStatus === 'Late' ? new Date().toISOString() : undefined
      });
    }

    // Adjust user parameters
    const targetUser = allUsers.find(u => u.UserID === userId);
    if (!targetUser) return;

    const newScore = Math.max(0, targetUser.TotalScore + pointDiff);
    const newLevel = getLevelName(newScore);

    const updatedUsers = allUsers.map(u => {
      if (u.UserID === userId) {
        return {
          ...u,
          TotalScore: newScore,
          CurrentLevel: newLevel
        };
      }
      return u;
    });

    // Score History node (only if points changed)
    let addedHistory: ScoreHistory[] = [];
    if (pointDiff !== 0) {
      addedHistory = [{
        ScoreID: Date.now() + Math.floor(Math.random() * 100),
        UserID: userId,
        ScoreChange: pointDiff,
        Reason: `Thay đổi trạng thái điểm danh sự kiện: "${activeEventNode?.EventName}" sang [${newStatus === 'Present' ? 'Có mặt' : newStatus === 'Late' ? 'Đi muộn' : newStatus === 'Absent' ? 'Vắng' : 'Có phép'}]`,
        ReferenceType: 'Event',
        ReferenceID: attendanceEventId,
        CreatedBy: currentUser.UserID,
        CreatedDate: new Date().toISOString()
      }];
    }

    // Notification
    const addedNotifs = [{
      NotificationID: Date.now() + 3,
      UserID: userId,
      Title: `Điểm danh sự kiện: ${newStatus === 'Present' ? 'Có mặt' : newStatus === 'Late' ? 'Đi trễ' : newStatus === 'Absent' ? 'Vắng' : 'Có phép'}`,
      Content: `Ban cán sự (${currentUser.FullName}) đã điểm danh bạn tại "${activeEventNode?.EventName}". Điểm thay đổi: ${pointDiff > 0 ? '+' : ''}${pointDiff}đ.`,
      Type: 'Event' as const,
      CreatedDate: new Date().toISOString(),
      IsRead: false
    }];

    onUpdateDatabase({
      attendance: updatedAttendance,
      users: updatedUsers,
      scoreHistory: addedHistory.length > 0 ? [...addedHistory, ...scoreHistory] : undefined,
      notifications: [...addedNotifs]
    });

    // Explicitly update localstorage for immediate reactive reload of other tabs
    localStorage.setItem('clb_attendance', JSON.stringify(updatedAttendance));

    showFeedback('success', `Đã cập nhật điểm danh cho ${targetUser.FullName}: ${newStatus}`);
  };


  // ----------------------------------------------------
  // SUB-TAB 4: REWARDS / INFRACTIONS STATE & HANDLERS
  // ----------------------------------------------------
  const [disciplineTargetUserId, setDisciplineTargetUserId] = useState<number>(
    allUsers.find(u => u.RoleID === RoleID.MEMBER)?.UserID || allUsers[0]?.UserID || 0
  );
  const [disciplineActionType, setDisciplineActionType] = useState<'Reward' | 'Warning'>('Reward');
  const [rewardKind, setRewardKind] = useState<'Thành viên xuất sắc' | 'Thành viên tích cực' | 'Thành viên chuyên cần' | 'Cống hiến nổi bật'>('Cống hiến nổi bật');
  const [warningMức, setWarningMức] = useState<'Mức 1' | 'Mức 2' | 'Mức 3'>('Mức 1');
  const [disciplineReason, setDisciplineReason] = useState<string>('');

  const handleDisciplineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplineTargetUserId) {
      showFeedback('error', 'Vui lòng chọn thành viên áp dụng!');
      return;
    }
    if (!disciplineReason.trim()) {
      showFeedback('error', 'Vui lòng cung cấp lý do khen thưởng / cảnh cáo cụ thể!');
      return;
    }

    const studentNode = allUsers.find(u => u.UserID === disciplineTargetUserId);
    if (!studentNode) return;

    let updatedUsers = [...allUsers];
    let scoreChange = 0;
    
    // Read existing list from localStorage rather than relying only on props for instant consistency
    const savedRewards: RewardRecord[] = JSON.parse(localStorage.getItem('clb_rewards') || '[]');
    const savedWarnings: WarningRecord[] = JSON.parse(localStorage.getItem('clb_warnings') || '[]');

    let updatedRewards = [...savedRewards];
    let updatedWarnings = [...savedWarnings];

    if (disciplineActionType === 'Reward') {
      scoreChange = rewardKind === 'Cống hiến nổi bật' ? 30 : 20;

      updatedRewards.push({
        RewardID: Date.now(),
        UserID: disciplineTargetUserId,
        RewardType: rewardKind,
        AwardDate: new Date().toISOString().split('T')[0],
        Reason: disciplineReason
      });

      // Update user score
      const newScore = studentNode.TotalScore + scoreChange;
      updatedUsers = allUsers.map(u => {
        if (u.UserID === disciplineTargetUserId) {
          return { ...u, TotalScore: newScore, CurrentLevel: getLevelName(newScore) };
        }
        return u;
      });
    } else {
      // Warning penalty
      scoreChange = warningMức === 'Mức 3' ? -30 : warningMức === 'Mức 2' ? -15 : -5;

      updatedWarnings.push({
        WarningID: Date.now(),
        UserID: disciplineTargetUserId,
        WarningLevel: warningMức,
        Reason: disciplineReason,
        CreatedDate: new Date().toISOString().split('T')[0],
        ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        Status: 'Active'
      });

      // Update user score
      const newScore = Math.max(0, studentNode.TotalScore + scoreChange);
      updatedUsers = allUsers.map(u => {
        if (u.UserID === disciplineTargetUserId) {
          return { ...u, TotalScore: newScore, CurrentLevel: getLevelName(newScore) };
        }
        return u;
      });
    }

    // Score History entry
    const newHistoryNode: ScoreHistory = {
      ScoreID: Date.now() + 5,
      UserID: disciplineTargetUserId,
      ScoreChange: scoreChange,
      Reason: disciplineActionType === 'Reward' 
        ? `Nhận danh hiệu khen thưởng: [${rewardKind}] - ${disciplineReason}`
        : `Phạt cảnh cáo vi kỷ luật: [${warningMức}] - ${disciplineReason}`,
      ReferenceType: 'System',
      CreatedBy: currentUser.UserID,
      CreatedDate: new Date().toISOString()
    };

    // Notification
    const newNotifNode: Notification = {
      NotificationID: Date.now() + 6,
      UserID: disciplineTargetUserId,
      Title: disciplineActionType === 'Reward' ? `🏆 Khen thưởng CLB: ${rewardKind}` : `⚠️ Phát lệnh Cảnh báo: ${warningMức}`,
      Content: disciplineActionType === 'Reward'
        ? `Chúc mừng bạn đã được Ban chủ nhiệm trao tặng danh hiệu "${rewardKind}" nhờ cống hiến: ${disciplineReason}. Điểm thưởng: +${scoreChange}đ.`
        : `Bạn đã nhận cảnh cáo kỷ luật ${warningMức} từ Ban chủ nhiệm. Lý do: ${disciplineReason}. Điểm phạt: ${scoreChange}đ.`,
      Type: disciplineActionType === 'Reward' ? 'Reward' : 'Warning',
      CreatedDate: new Date().toISOString(),
      IsRead: false
    };

    onUpdateDatabase({
      users: updatedUsers,
      rewards: updatedRewards,
      warnings: updatedWarnings,
      scoreHistory: [newHistoryNode, ...scoreHistory],
      notifications: [newNotifNode]
    });

    // Write immediately to localstorage (since metadata states need local sync)
    localStorage.setItem('clb_rewards', JSON.stringify(updatedRewards));
    localStorage.setItem('clb_warnings', JSON.stringify(updatedWarnings));

    setDisciplineReason('');
    showFeedback('success', `Đã ghi nhận dữ liệu thi đua cho ${studentNode.FullName} thành công!`);
  };


  // ----------------------------------------------------
  // STRICT USER ACCESSIBILITY CHECK
  // ----------------------------------------------------
  if (currentUser.RoleID < RoleID.ADMIN) {
    return (
      <div className="max-w-xl mx-auto py-10 select-none font-sans text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-150 shadow-inner">
            <ShieldAlert size={36} className="animate-pulse" />
          </div>
          <h2 className="font-display font-bold text-lg text-slate-800 uppercase tracking-wide mb-2">
            Yêu cầu Quyền Điều Hành (Admin)
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
            Không gian này dành riêng cho Ban chủ nhiệm và Trưởng/Phó ban của CLB CCT - COMTECH để quản lý chấm điểm, kiểm tra minh chứng học tập và quản trị sự kiện.
          </p>

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-left text-xs mb-6">
            <strong className="font-bold text-indigo-950 block mb-1">💡 Làm sao để trải nghiệm thử tài khoản Admin?</strong>
            <p className="text-indigo-800 leading-normal">
              Rất đơn giản! Hãy sử dụng widget <strong className="font-bold">"Tài khoản mô phỏng (Simulator)"</strong> ở thanh danh mục bên trái, click chọn chuyển tài khoản sang <strong className="font-bold">"Trần Thế Phong"</strong> (Chủ nhiệm / Admin cao nhất) hoặc <strong className="font-bold">"Trần Văn Hùng"</strong> (Trưởng ban Kỹ thuật) là toàn bộ chức năng này sẽ được kích hoạt tức thì!
            </p>
          </div>

          <div className="text-[11px] text-slate-400">
            *Tài khoản hiện tại của bạn: <strong className="text-slate-700">{currentUser.FullName}</strong> ({getLevelName(currentUser.TotalScore)} • {currentUser.StudentCode})
          </div>
        </div>
      </div>
    );
  }

  // Get active checkins for selected event
  const getSimulatedCheckinStatus = (userId: number): 'Present' | 'Late' | 'Absent' | 'Excused' | 'None' => {
    // Read attendance live from localStorage
    const saved: Attendance[] = JSON.parse(localStorage.getItem('clb_attendance') || '[]');
    const record = saved.find(a => a.UserID === userId && a.EventID === attendanceEventId);
    return record ? record.Status : 'None';
  };

  return (
    <div className="max-w-2xl mx-auto py-4 select-none font-sans animate-fade-in">
      
      {/* Toast Overlay Banner */}
      {toastFeedback && (
        <div id="admin-toast" className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded shadow-lg border text-xs font-bold uppercase tracking-wider animate-slide-in ${
          toastFeedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          {toastFeedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-600" />}
          <span>{toastFeedback.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
        {/* Header Block */}
        <div className="p-5 border-b border-slate-100 bg-slate-950 text-white flex justify-between items-center">
          <div>
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2 uppercase tracking-wider">
              <ShieldAlert size={18} className="text-indigo-400" /> Bảng Quản Trị & Điểm Số
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Bảng vận hành chuyên sâu cho Ban chủ nhiệm để nạp điểm, duyệt bảo cáo và điểm danh.</p>
          </div>
          <span className="text-[9px] font-bold border border-indigo-500/50 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded tracking-widest uppercase">
            {currentUser.RoleID === RoleID.SUPER_ADMIN ? 'SUPER ADMIN' : 'ADMIN BOARD'}
          </span>
        </div>

        {/* Workspace selector Submenu Navigation tabs */}
        <div className="flex border-b border-slate-150 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase tracking-widest">
          <button 
            onClick={() => setActiveTab('scoring')}
            className={`flex-1 py-3.5 border-b-2 flex flex-col items-center gap-1 transition ${
              activeTab === 'scoring' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <TrendingUp size={14} /> Chấm & nạp điểm
          </button>
          
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-3.5 border-b-2 flex flex-col items-center gap-1 relative transition ${
              activeTab === 'approvals' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Duyệt minh chứng</span>
            {approvals.filter(ap => ap.Status === 'Pending').length > 0 && (
              <span className="absolute top-2 right-4 bg-red-500 text-white text-[8px] h-3.5 px-1 flex items-center justify-center rounded font-bold min-w-3.5">
                {approvals.filter(ap => ap.Status === 'Pending').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-3.5 border-b-2 flex flex-col items-center gap-1 transition ${
              activeTab === 'attendance' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <UserCheck size={14} /> Điểm danh sự kiện
          </button>

          <button 
            onClick={() => setActiveTab('disciplines')}
            className={`flex-1 py-3.5 border-b-2 flex flex-col items-center gap-1 transition ${
              activeTab === 'disciplines' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Award size={14} /> Thi đua khen thưởng
          </button>

          <button 
            onClick={() => setActiveTab('registrations')}
            className={`flex-1 py-3.5 border-b-2 flex flex-col items-center gap-1 relative transition ${
              activeTab === 'registrations' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Users size={14} />
            <span>Duyệt tài khoản</span>
            {registerRequests.filter(r => r.Status === 'Pending').length > 0 && (
              <span className="absolute top-2 right-4 bg-indigo-600 text-white text-[8px] h-3.5 px-1 flex items-center justify-center rounded font-mono font-extrabold min-w-3.5">
                {registerRequests.filter(r => r.Status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">

          {/* ----------------------------------------------------
              SECTION 1: DIRECT POINT ENTRY & Presets
              ---------------------------------------------------- */}
          {activeTab === 'scoring' && (
            <div className="animate-fade-in flex flex-col gap-5">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                  1. Chọn thành viên cần tác động
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Tìm thành viên</label>
                    <select
                      value={selectedScoringUserId}
                      onChange={(e) => setSelectedScoringUserId(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded py-2 px-3 text-xs w-full text-slate-800 font-bold outline-none cursor-pointer focus:border-slate-400"
                    >
                      {allUsers
                        .filter(u => u.RoleID === RoleID.MEMBER)
                        .map(u => (
                          <option key={u.UserID} value={u.UserID}>
                            {u.FullName} ({u.StudentCode})
                          </option>
                        ))}
                    </select>
                  </div>

                  {selectedUserNode && (
                    <div className="bg-white p-2.5 rounded border border-slate-150 flex items-center gap-3">
                      <img 
                        src={selectedUserNode.Avatar} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                        alt="" 
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-950 block truncate">{selectedUserNode.FullName}</span>
                        <div className="flex gap-1.5 items-center mt-0.5">
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-mono">
                            {selectedUserNode.StudentCode}
                          </span>
                          <span className="text-[10px] text-slate-900 font-extrabold font-mono">
                            {selectedUserNode.TotalScore}đ ({selectedUserNode.CurrentLevel})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Entry */}
              <form onSubmit={handleDirectScoringSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Giá trị điểm tác động</label>
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="Có thể điền số âm ví dụ -10"
                        value={scoringValue}
                        onChange={(e) => setScoringValue(e.target.value)}
                        required
                        className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs w-full outline-none font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Nguyên nhân / Danh mục</label>
                    <select
                      value={scoringType}
                      onChange={(e) => setScoringType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs w-full text-slate-800 font-bold outline-none cursor-pointer"
                    >
                      <option value="Manual">Cập nhật thủ công (Ban điều hành)</option>
                      <option value="Event">Hoạt động Sự kiện club</option>
                      <option value="Task">Duyệt bài vở / Dự án</option>
                      <option value="System">Tự động hóa hệ thống</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Lý do chấm điểm cụ thể (Hiển thị tới người dùng)</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Hoàn thành thiết kế ấn phẩm truyền thông tuần 2, Trực buổi Workshop FPT..."
                    value={scoringReason}
                    onChange={(e) => setScoringReason(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs w-full outline-none resize-none font-medium text-slate-700"
                  />
                </div>

                {/* Preset Fast Actions */}
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                    Hoạt động mẫu (Presets nạp điểm nhanh)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button"
                      onClick={() => applyPresetScoring(10, "Tích cực tham gia hoạt động dã ngoại và hỗ trợ setup sự kiện CLB", "Event")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded px-2.5 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                    >
                      +10đ Setup Sự Kiện
                    </button>
                    <button 
                      type="button"
                      onClick={() => applyPresetScoring(15, "Hoàn thành xuất sắc nhiệm vụ được Admin giao phó đúng deadline", "Task")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded px-2.5 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                    >
                      +15đ Khởi Tạo Code/Thiết Kế
                    </button>
                    <button 
                      type="button"
                      onClick={() => applyPresetScoring(5, "Trực ban nghiêm túc, quét dọn và bảo quản phòng học CLB", "System")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded px-2.5 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                    >
                      +5đ Trực Nhật Phòng
                    </button>
                    <button 
                      type="button"
                      onClick={() => applyPresetScoring(-10, "Trốn tránh trách nhiệm, vắng họp không có lý do chính đáng gửi Admin", "Manual")}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-250 rounded px-2.5 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                    >
                      -10đ Trốn Họp CLB
                    </button>
                    <button 
                      type="button"
                      onClick={() => applyPresetScoring(-15, "Quá hạn hạn hoàn thành nhiệm vụ và thiếu tinh thần phối hợp ban", "Task")}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-250 rounded px-2.5 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                    >
                      -15đ Trễ Hạn Hoàn Thành
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-4 rounded text-[10px] uppercase tracking-wider flex justify-center items-center gap-1.5 mt-2 transition"
                >
                  <Send size={12} /> Xác Nhận Nạp Điểm Số (+/- Điểm)
                </button>
              </form>
            </div>
          )}


          {/* ----------------------------------------------------
              SECTION 2: REVIEW EVIDENCE PORTAL
              ---------------------------------------------------- */}
          {activeTab === 'approvals' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 block">
                  Danh sách báo cáo nộp minh chứng cần thẩm định
                </span>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Chưa duyệt: {approvals.filter(ap => ap.Status === 'Pending').length} bài
                </span>
              </div>

              <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
                {approvals
                  .filter(ap => ap.Status === 'Pending')
                  .map((ap) => {
                    const linkedTask = tasks.find(t => t.TaskID === ap.TaskID);
                    const submitterNode = allUsers.find(u => u.UserID === linkedTask?.AssignedTo);

                    return (
                      <div key={ap.ApprovalID} className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <img 
                              src={submitterNode?.Avatar} 
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" 
                              alt="" 
                            />
                            <div>
                              <strong 
                                onClick={() => submitterNode && onViewUserProfile(submitterNode.UserID)}
                                className="text-xs font-bold text-slate-900 hover:underline cursor-pointer block"
                              >
                                {submitterNode?.FullName}
                              </strong>
                              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{submitterNode?.StudentCode}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                              Chờ phê duyệt
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 block mt-1">Đóng góp: +15đ</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border border-slate-150">
                          <span className="text-[9px] font-bold text-indigo-500 uppercase font-mono tracking-tight block mb-0.5">Nhiệm Vụ Giao Nhận:</span>
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{getTaskName(ap.TaskID)}</h4>
                          {linkedTask?.Description && (
                            <p className="text-[11px] text-slate-500 leading-normal mt-1 italic">Yêu cầu: {linkedTask.Description}</p>
                          )}
                          
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-[11px]">
                            {ap.EvidenceURL && (
                              <div className="flex items-center gap-1 text-sky-700 hover:underline">
                                <Link2 size={12} className="shrink-0" />
                                <a href={ap.EvidenceURL} target="_blank" rel="noopener noreferrer" className="font-mono truncate max-w-md font-semibold">
                                  {ap.EvidenceURL}
                                </a>
                              </div>
                            )}
                            {ap.EvidenceComment && (
                              <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                                💬 <b>Bối cảnh:</b> {ap.EvidenceComment}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="flex flex-col gap-2.5">
                          <input 
                            type="text" 
                            placeholder="Nhập nhận xét của ban quản trị (không bắt buộc)..."
                            value={approvalComments[ap.ApprovalID] || ''}
                            onChange={(e) => setApprovalComments({
                              ...approvalComments,
                              [ap.ApprovalID]: e.target.value
                            })}
                            className="bg-white border border-slate-200 rounded py-2 px-3 text-xs w-full text-slate-700 outline-none"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleReviewSubmission(ap.ApprovalID, 'Approved')}
                              className="bg-slate-900 border border-slate-950 hover:bg-slate-950 text-white font-bold py-2 px-4 rounded text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition"
                            >
                              <Check size={12} /> Đồng ý & Cộng +15đ
                            </button>
                            <button
                              onClick={() => handleReviewSubmission(ap.ApprovalID, 'Rejected')}
                              className="bg-red-50 text-red-700 border border-red-250 hover:bg-red-100 font-bold py-2 px-4 rounded text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition"
                            >
                              <XCircle size={12} /> Từ chối duyệt
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {approvals.filter(ap => ap.Status === 'Pending').length === 0 && (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded">
                    <CheckCircle2 className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-xs text-slate-500 font-bold">Không còn báo cáo nào đang chờ duyệt.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Các thành viên sẽ nhận được thông báo ngay khi họ nộp bài.</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ----------------------------------------------------
              SECTION 3: DIRECT ATTENDANCE MANAGER
              ---------------------------------------------------- */}
          {activeTab === 'attendance' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">1. Chọn sự kiện CLB cần điểm danh</label>
                <select
                  value={attendanceEventId}
                  onChange={(e) => setAttendanceEventId(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded py-2 px-3 text-xs w-full text-slate-800 font-bold outline-none cursor-pointer"
                >
                  {events.map(ev => (
                    <option key={ev.EventID} value={ev.EventID}>
                      {ev.EventName} ({ev.EventDate})
                    </option>
                  ))}
                </select>

                {activeEventNode && (
                  <div className="text-[10px] text-slate-500 leading-normal mt-2 font-medium">
                    📍 Địa điểm: {activeEventNode.Location} • Mô tả hoạt động: {activeEventNode.Description}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 block">
                  Bảng danh sách thành viên & Điểm danh nhanh
                </span>
                <span className="text-[9px] font-mono text-slate-400 italic">
                  *Cơ cấu điểm: Có mặt (+10đ), Đi trễ (+5đ), Trốn họp (-10đ), Có phép (0đ)
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-[355px] overflow-y-auto pr-1">
                {allUsers
                  .filter(u => u.RoleID === RoleID.MEMBER)
                  .map((user) => {
                    const status = getSimulatedCheckinStatus(user.UserID);

                    return (
                      <div key={user.UserID} className="bg-white border border-slate-200 p-2.5 rounded flex items-center justify-between gap-3 shadow-none hover:bg-slate-50/50 transition">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={user.Avatar} 
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" 
                            alt="" 
                          />
                          <div>
                            <strong 
                              onClick={() => onViewUserProfile(user.UserID)}
                              className="text-xs font-bold text-slate-900 hover:underline cursor-pointer block"
                            >
                              {user.FullName}
                            </strong>
                            <div className="flex gap-1.5 items-center mt-0.5">
                              <span className="text-[9px] font-mono font-bold text-slate-400">{user.StudentCode}</span>
                              <span className="text-[10px] text-indigo-600 font-bold font-mono">{user.TotalScore}đ</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive toggle buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCheckInToggle(user.UserID, status, 'Present')}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition border ${
                              status === 'Present'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Có mặt
                          </button>
                          
                          <button
                            onClick={() => handleCheckInToggle(user.UserID, status, 'Late')}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition border ${
                              status === 'Late'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Đi trễ
                          </button>

                          <button
                            onClick={() => handleCheckInToggle(user.UserID, status, 'Absent')}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition border ${
                              status === 'Absent'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Vắng trốn
                          </button>

                          <button
                            onClick={() => handleCheckInToggle(user.UserID, status, 'Excused')}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition border ${
                              status === 'Excused'
                                ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Có phép
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}


          {/* ----------------------------------------------------
              SECTION 4: REWARDS & DISCIPLINE LEDGER
              ---------------------------------------------------- */}
          {activeTab === 'disciplines' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" /> Bản thi đua chuyên sâu: Khen thưởng & Cảnh cáo vi phạm
                </h3>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Thiết lập khen thưởng phong trào hoặc phê duyệt mức kỷ luật tương xứng. Điểm thưởng cúp cống hiến sẽ trực tiếp thay đổi thứ bậc và classe của sinh viên.
                </p>
              </div>

              {/* Form Entry */}
              <form onSubmit={handleDisciplineSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Áp dụng cho thành viên</label>
                    <select
                      value={disciplineTargetUserId}
                      onChange={(e) => setDisciplineTargetUserId(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded py-2 px-3 text-xs w-full text-slate-800 font-bold outline-none cursor-pointer"
                    >
                      {allUsers
                        .filter(u => u.RoleID === RoleID.MEMBER)
                        .map(u => (
                          <option key={u.UserID} value={u.UserID}>
                            {u.FullName} ({u.StudentCode})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Loại tác vụ hình thức</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDisciplineActionType('Reward')}
                        className={`flex-1 py-2 text-xs font-bold rounded uppercase transition border ${
                          disciplineActionType === 'Reward'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🏆 Khen Thưởng
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisciplineActionType('Warning')}
                        className={`flex-1 py-2 text-xs font-bold rounded uppercase transition border ${
                          disciplineActionType === 'Warning'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ⚠️ Thẻ Cảnh Cáo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub configuration options based on chosen path */}
                {disciplineActionType === 'Reward' ? (
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Chọn Huy Chương / Danh hiệu</label>
                    <select
                      value={rewardKind}
                      onChange={(e) => setRewardKind(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs w-full text-slate-800 font-bold outline-none cursor-pointer"
                    >
                      <option value="Cống hiến nổi bật">Cống hiến nổi bật xuất sắc (+30 điểm)</option>
                      <option value="Thành viên xuất sắc">Thành viên xuất sắc tháng (+20 điểm)</option>
                      <option value="Thành viên tích cực">Thành viên tích cực năng nổ (+20 điểm)</option>
                      <option value="Thành viên chuyên cần">Thành viên chuyên cần tích lũy (+20 điểm)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Chọn Mức Cảnh cáo vi kỷ luật</label>
                    <select
                      value={warningMức}
                      onChange={(e) => setWarningMức(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs w-full text-slate-800 font-bold outline-none cursor-pointer"
                    >
                      <option value="Mức 1">Mức 1: Cảnh cáo ban đầu, nhắc nhở (-5 điểm)</option>
                      <option value="Mức 2">Mức 2: Tái phạm nhiều lần sự kiện nội bộ (-15 điểm)</option>
                      <option value="Mức 3">Mức 3: Đóng góp sút giảm, vi phạm nghiệm trọng (-30 điểm)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Trích dẫn tóm lược nguyên nhân khen thưởng / kỷ luật</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Đóng góp dự án phần mềm chính CLB / Trốn sinh hoạt ban 3 lần liên tục..."
                    value={disciplineReason}
                    onChange={(e) => setDisciplineReason(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs w-full outline-none resize-none font-medium text-slate-705"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-4 rounded text-[10px] uppercase tracking-wider flex justify-center items-center gap-1.5 mt-2 transition"
                >
                  <Award size={12} /> Xác Nhận Phát Quyết Định Thi Đua CLB
                </button>
              </form>
            </div>
          )}

          {/* ----------------------------------------------------
              SECTION 5: REGISTRATION APPROVAL FLOW
              ---------------------------------------------------- */}
          {activeTab === 'registrations' && (
            <div className="space-y-6 animate-fade-in text-neutral-800">
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-start gap-3">
                <Users className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-sans mb-1">
                    Cổng duyệt tài khoản ứng tuyển đăng ký
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Đây là không gian quản trị hồ sơ tuyển thành viên mới gia nhập. Khi bạn bấm <strong className="text-emerald-750">Chấp nhận</strong>, hệ thống CRM sẽ tự động cấp tài khoản, cấp bù <strong>+10 điểm chào mừng</strong>, và thông báo cho thành viên đăng nhập. Khi bạn bấm <strong className="text-rose-700">Từ chối</strong>, ứng viên sẽ nhận được thư phản hồi cùng lý do giải trình trong Hòm thư tuyển sinh.
                  </p>
                </div>
              </div>

              {/* Advanced registrations query and status filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-neutral-100">
                <div className="relative w-full sm:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={registrationsQuery}
                    onChange={(e) => setRegistrationsQuery(e.target.value)}
                    placeholder="Tìm theo Tên, MSSV hoặc Email..."
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-2 outline-none focus:border-slate-400 transition"
                  />
                </div>
                <div className="text-[10px] text-slate-505 font-bold font-mono">
                  Tổng đơn lưu trữ: {registerRequests.length} đơn
                </div>
              </div>

              {/* LIST OF PENDING APPLICATIONS */}
              <div>
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-3 font-extrabold flex items-center gap-1.5">
                  ⚠️ Danh sách đơn chờ duyệt ({registerRequests.filter(r => r.Status === 'Pending').length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registerRequests
                    .filter(r => r.Status === 'Pending')
                    .filter(r => {
                      const q = registrationsQuery.toLowerCase().trim();
                      if (!q) return true;
                      return r.FullName.toLowerCase().includes(q) || r.StudentCode.toLowerCase().includes(q) || r.Email.toLowerCase().includes(q);
                    })
                    .map((req) => {
                      const deptName = DEPARTMENTS.find(d => d.DepartmentID === req.DepartmentID)?.DepartmentName || "Ban chung";
                      return (
                        <div 
                          key={req.RequestID}
                          className="bg-white border-2 border-indigo-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col gap-3 text-slate-800"
                        >
                          {/* Top metadata */}
                          <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 font-sans leading-tight">
                                {req.FullName}
                              </h4>
                              <p className="text-[10px] text-indigo-605 font-mono font-bold mt-0.5">
                                {req.StudentCode} • 📱 {req.Phone}
                              </p>
                            </div>
                            <span className="bg-indigo-55 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {deptName}
                            </span>
                          </div>

                          {/* Account details */}
                          <div className="text-[11px] text-slate-650 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400">GMAIL:</span>
                              <strong className="text-slate-850 font-bold select-all">{req.Email}</strong>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400">MẬT KHẨU ĐẶT:</span>
                              <strong className="text-slate-850 font-bold">{req.Password}</strong>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400">NGÀY ĐĂNG KÍ:</span>
                              <span className="text-slate-500 font-bold">
                                {new Date(req.CreatedDate).toLocaleDateString('vi-VN')} {new Date(req.CreatedDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>

                          {/* Rejection comment field */}
                          <div>
                            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                              Lý do từ chối (bắt buộc điền nếu chọn Từ chối đơn)
                            </label>
                            <input
                              type="text"
                              value={rejectReasons[req.RequestID] || ''}
                              onChange={(e) => setRejectReasons({
                                ...rejectReasons,
                                [req.RequestID]: e.target.value
                              })}
                              placeholder="Ví dụ: Chưa đạt tiêu chí kỹ thuật / Trùng thông tin ứng viên..."
                              className="bg-slate-50 border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg block w-full px-3 py-1.5 outline-none focus:border-slate-350 transition font-sans"
                            />
                          </div>

                          {/* Action pairs buttons */}
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              onClick={() => {
                                const ok = window.confirm(`Bạn có chắc chắn phê duyệt tài khoản và kết nạp ${req.FullName} vào CLB?`);
                                if (ok) handleReviewRegistration(req.RequestID, true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase py-2 rounded-xl transition flex justify-center items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Check size={12} /> Chấp nhận duyệt
                            </button>
                            
                            <button
                              onClick={() => {
                                const reason = rejectReasons[req.RequestID]?.trim();
                                if (!reason) {
                                  alert('Vui lòng điền lý do từ chối trước khi bác bỏ đơn yêu cầu!');
                                  return;
                                }
                                const ok = window.confirm(`Xác nhận từ chối đơn đăng ký tuyển sinh của ${req.FullName}?`);
                                if (ok) handleReviewRegistration(req.RequestID, false);
                              }}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 font-extrabold text-[10px] uppercase py-2 rounded-xl transition flex justify-center items-center gap-1 cursor-pointer"
                            >
                              <XCircle size={12} /> Từ chối đơn
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {registerRequests.filter(r => r.Status === 'Pending').length === 0 && (
                    <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 py-10 rounded-2xl text-center text-slate-400 text-xs font-bold font-sans">
                      🎉 Hoan hô! Hiện tại không còn đơn nộp ứng tuyển nào chờ phê duyệt.
                    </div>
                  )}
                </div>
              </div>

              {/* COMPLETED APPROVED / REJECTED HISTORIC LIST */}
              <div>
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-3 font-extrabold">
                  📋 Thống kê lịch sử duyệt đơn gần đây ({registerRequests.filter(r => r.Status !== 'Pending').length})
                </h3>

                <div className="bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-505 font-mono font-bold uppercase text-[9px] tracking-wider">
                          <th className="py-2.5 px-4">Ứng viên / MSSV</th>
                          <th className="py-2.5 px-4">Gmail / SĐT</th>
                          <th className="py-2.5 px-4">Bộ Ban</th>
                          <th className="py-2.5 px-4 text-center">Trạng thái</th>
                          <th className="py-2.5 px-4">Lý do từ chối (nếu có)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 bg-white">
                        {registerRequests
                          .filter(r => r.Status !== 'Pending')
                          .filter(r => {
                            const q = registrationsQuery.toLowerCase().trim();
                            if (!q) return true;
                            return r.FullName.toLowerCase().includes(q) || r.StudentCode.toLowerCase().includes(q) || r.Email.toLowerCase().includes(q);
                          })
                          .map((req) => {
                            const deptName = DEPARTMENTS.find(d => d.DepartmentID === req.DepartmentID)?.DepartmentName || "Ban chung";
                            return (
                              <tr key={req.RequestID} className="hover:bg-slate-50/50 transition">
                                <td className="py-2.5 px-4 animate-fade-in">
                                  <strong className="block text-slate-800 font-bold font-sans">{req.FullName}</strong>
                                  <span className="text-[10px] text-slate-400 font-mono">{req.StudentCode}</span>
                                </td>
                                <td className="py-2.5 px-4 font-mono text-slate-600">
                                  <span className="block text-[11px]">{req.Email}</span>
                                  <span className="text-[10px] text-slate-400">{req.Phone}</span>
                                </td>
                                <td className="py-2.5 px-4 font-bold text-slate-700">
                                  {deptName}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                                    req.Status === 'Approved' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                                      : 'bg-red-50 text-red-650 border border-red-200'
                                  }`}>
                                    {req.Status === 'Approved' ? 'ĐÃ PHÊ DUYỆT' : 'BỊ TỪ CHỐI'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-slate-500 italic max-w-xs truncate" title={req.RejectReason}>
                                  {req.RejectReason || "N/A"}
                                </td>
                              </tr>
                            );
                          })}

                        {registerRequests.filter(r => r.Status !== 'Pending').length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-400 font-bold font-sans italic bg-slate-50">
                              Lịch sử trống. Chưa có đơn đăng ký nào được xử lý gần đây.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
