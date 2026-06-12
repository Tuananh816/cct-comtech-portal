/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, MessageSquare, MapPin, Calendar, CheckCircle2, AlertTriangle, 
  Send, QrCode, ClipboardList, Eye, Plus, Check, X, ShieldCheck, UserCheck, RefreshCw, Camera
} from 'lucide-react';
import { 
  User, ClubEvent, Attendance, Task, TaskApproval, ScoreHistory, News, 
  Announcement, DeptID, DEPARTMENTS, RoleID
} from '../types';

interface FeedSectionProps {
  currentUser: User;
  allUsers: User[];
  events: ClubEvent[];
  attendance: Attendance[];
  tasks: Task[];
  approvals: TaskApproval[];
  news: News[];
  scoreHistory: ScoreHistory[];
  onUpdateDatabase: (updates: {
    users?: User[];
    attendance?: Attendance[];
    tasks?: Task[];
    approvals?: TaskApproval[];
    news?: News[];
    scoreHistory?: ScoreHistory[];
    notifications?: any[];
  }) => void;
  onViewUserProfile: (userId: number) => void;
}

export default function FeedSection({
  currentUser,
  allUsers,
  events,
  attendance,
  tasks,
  approvals,
  news,
  scoreHistory,
  onUpdateDatabase,
  onViewUserProfile
}: FeedSectionProps) {

  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [newsId: number]: string }>({});
  const [activeQrModal, setActiveQrModal] = useState<number | null>(null);
  const [scanningEventId, setScanningEventId] = useState<number | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [adminCommentInputs, setAdminCommentInputs] = useState<{ [approvalId: number]: string }>({});

  // Story avatars representing departments
  const departmentStories = [
    { id: DeptID.TRUYEN_THONG, name: "Truyền thông", icon: "📢", color: "from-pink-500 to-yellow-500" },
    { id: DeptID.KY_THUAT, name: "Kỹ thuật", icon: "💻", color: "from-blue-600 to-purple-600" },
    { id: DeptID.NHAN_SU, name: "Nhân sự", icon: "🤝", color: "from-teal-400 to-emerald-500" },
    { id: DeptID.SU_KIEN, name: "Sự kiện", icon: "🎉", color: "from-orange-500 to-red-500" },
  ];

  const getAuthor = (authorId: number): User => {
    return allUsers.find(u => u.UserID === authorId) || allUsers[0];
  };

  const getDeptName = (deptId: number): string => {
    return DEPARTMENTS.find(d => d.DepartmentID === deptId)?.DepartmentName || "Bản tin Chung";
  };

  // Comments submit functionality
  const handleAddComment = (newsId: number) => {
    const text = commentInputs[newsId]?.trim();
    if (!text) return;

    const updatedNews = news.map(item => {
      if (item.NewsID === newsId) {
        return {
          ...item,
          Comments: [
            ...item.Comments,
            {
              id: Date.now(),
              userName: currentUser.FullName.split(' ').pop() || "Member",
              text,
              date: new Date().toISOString()
            }
          ]
        };
      }
      return item;
    });

    onUpdateDatabase({ news: updatedNews });
    setCommentInputs(prev => ({ ...prev, [newsId]: '' }));
  };

  // Like News Post functionality
  const handleLikePost = (newsId: number) => {
    const updatedNews = news.map(item => {
      if (item.NewsID === newsId) {
        const isLiked = item.LikedBy.includes(currentUser.UserID);
        return {
          ...item,
          Likes: isLiked ? item.Likes - 1 : item.Likes + 1,
          LikedBy: isLiked 
            ? item.LikedBy.filter(uid => uid !== currentUser.UserID) 
            : [...item.LikedBy, currentUser.UserID]
        };
      }
      return item;
    });
    onUpdateDatabase({ news: updatedNews });
  };

  // Simulated QR check-in scanning flow
  const handleStartScanCheckin = (eventId: number) => {
    setScanningEventId(eventId);
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('success');
      setTimeout(() => {
        // Complete the checkin
        checkinUser(eventId, currentUser.UserID);
      }, 1000);
    }, 2000);
  };

  const checkinUser = (eventId: number, userId: number, forcedStatus?: 'Present' | 'Late' | 'Absent' | 'Excused') => {
    const event = events.find(e => e.EventID === eventId);
    if (!event) return;

    // Check if attendance already exists
    const existingIdx = attendance.findIndex(a => a.UserID === userId && a.EventID === eventId);
    let updatedAttendance = [...attendance];
    
    const finalStatus = forcedStatus || (new Date().getHours() >= 19 ? 'Late' : 'Present');

    let scoreReward = 0;
    if (finalStatus === 'Present') scoreReward = 5;
    else if (finalStatus === 'Late') scoreReward = -5;
    else if (finalStatus === 'Absent') scoreReward = -5;

    if (existingIdx !== -1) {
      // Avoid score duplicates if already present
      const prevStatus = updatedAttendance[existingIdx].Status;
      if (prevStatus === finalStatus) {
        // No modification
        setScanningEventId(null);
        setScanStatus('idle');
        return;
      }
      
      // Update existing attendance
      updatedAttendance[existingIdx] = {
        ...updatedAttendance[existingIdx],
        Status: finalStatus,
        CheckInTime: new Date().toISOString()
      };
    } else {
      updatedAttendance.push({
        AttendanceID: Date.now() + Math.random(),
        UserID: userId,
        EventID: eventId,
        Status: finalStatus,
        CheckInTime: new Date().toISOString()
      });
    }

    // Allocate score history
    const isSelfCheckin = userId === currentUser.UserID;
    const historyReason = `Mô phỏng check-in sự kiện ${event.EventName}: ${
      finalStatus === 'Present' ? 'Có mặt đúng giờ (+5đ)' : finalStatus === 'Late' ? 'Đi trễ (-5đ)' : 'Vắng không phép (-5đ)'
    }`;

    // Feed updated users list
    const updatedUsers = allUsers.map(u => {
      if (u.UserID === userId) {
        const revisedScore = Math.max(0, u.TotalScore + scoreReward);
        return {
          ...u,
          TotalScore: revisedScore,
          CurrentLevel: Math.max(0, u.TotalScore + scoreReward) >= 200 ? "Kim Cương" : Math.max(0, u.TotalScore + scoreReward) >= 120 ? "Bạch Kim" : Math.max(0, u.TotalScore + scoreReward) >= 80 ? "Vàng" : "Đồng"
        };
      }
      return u;
    });

    const newScoreLog: ScoreHistory = {
      ScoreID: Date.now() + Math.random(),
      UserID: userId,
      ScoreChange: scoreReward,
      Reason: historyReason,
      ReferenceType: 'Event',
      ReferenceID: eventId,
      CreatedBy: isSelfCheckin ? userId : currentUser.UserID,
      CreatedDate: new Date().toISOString()
    };

    // Notification insertion
    const updatedNotifications = [
      {
        NotificationID: Date.now() + Math.random(),
        UserID: userId,
        Title: isSelfCheckin ? "Bạn đã điểm danh thành công" : "Nhật ký điểm danh cập nhật",
        Content: `Trạng thái: ${finalStatus === 'Present' ? 'Có mặt' : finalStatus === 'Late' ? 'Trễ học' : 'Vắng mặt'}. Điểm số ghi nhận: ${scoreReward >= 0 ? '+' : ''}${scoreReward}đ`,
        Type: 'Event',
        CreatedDate: new Date().toISOString(),
        IsRead: false
      }
    ];

    onUpdateDatabase({
      attendance: updatedAttendance,
      users: updatedUsers,
      scoreHistory: [...scoreHistory, newScoreLog],
      notifications: updatedNotifications
    });

    setScanningEventId(null);
    setScanStatus('idle');
  };

  // Member Task Evidence Submission Approval flow (Section 2.5)
  const handleReviewTaskEvidence = (approvalId: number, isApproved: boolean) => {
    const approval = approvals.find(ap => ap.ApprovalID === approvalId);
    if (!approval) return;

    const task = tasks.find(t => t.TaskID === approval.TaskID);
    if (!task) return;

    const assignee = allUsers.find(u => u.UserID === task.AssignedTo);
    if (!assignee) return;

    const adminComment = adminCommentInputs[approvalId]?.trim() || (isApproved ? "Đồng ý phê duyệt hoàn thành nhiệm vụ!" : "Từ chối duyệt. Minh chứng không đáp ứng đúng yêu cầu.");

    // 1. Update task approvals
    const updatedApprovals = approvals.map(ap => {
      if (ap.ApprovalID === approvalId) {
        return {
          ...ap,
          Status: isApproved ? 'Approved' as const : 'Rejected' as const,
          ApprovedBy: currentUser.UserID,
          ApprovedDate: new Date().toISOString(),
          Comment: adminComment
        };
      }
      return ap;
    });

    // 2. Update tasks
    const updatedTasks = tasks.map(t => {
      if (t.TaskID === task.TaskID) {
        return {
          ...t,
          Status: isApproved ? 'Completed' as const : 'Rejected' as const
        };
      }
      return t;
    });

    // 3. Score logic: +15 points for completed, -10 for rejected/uncompleted
    const scoreAddAmount = isApproved ? 15 : -5;
    const updatedUsers = allUsers.map(u => {
      if (u.UserID === assignee.UserID) {
        const resScore = Math.max(0, u.TotalScore + scoreAddAmount);
        return {
          ...u,
          TotalScore: resScore
        };
      }
      return u;
    });

    // 4. Create score history
    const scoreLog: ScoreHistory = {
      ScoreID: Date.now() + Math.random(),
      UserID: assignee.UserID,
      ScoreChange: scoreAddAmount,
      Reason: isApproved 
        ? `Được duyệt nhiệm vụ: '${task.TaskName}' (+15đ)`
        : `Bị từ chối minh chứng nhiệm vụ: '${task.TaskName}' (Khấu trừ -5đ)`,
      ReferenceType: 'Task',
      ReferenceID: task.TaskID,
      CreatedBy: currentUser.UserID,
      CreatedDate: new Date().toISOString()
    };

    // 5. Send notification to Member
    const clientNotification = {
      NotificationID: Date.now() + Math.random(),
      UserID: assignee.UserID,
      Title: isApproved ? "Nhiệm vụ của bạn đã ĐƯỢC DUYỆT!" : "Nhiệm vụ của bạn đã BỊ TỪ CHỐI!",
      Content: `Quản trị viên đã kiểm tra minh chứng nhiệm vụ '${task.TaskName}' của bạn. Nhận xét: "${adminComment}".`,
      Type: 'Task',
      CreatedDate: new Date().toISOString(),
      IsRead: false
    };

    onUpdateDatabase({
      approvals: updatedApprovals,
      tasks: updatedTasks,
      users: updatedUsers,
      scoreHistory: [...scoreHistory, scoreLog],
      notifications: [clientNotification]
    });

    // Zero-out input
    setAdminCommentInputs(prev => ({ ...prev, [approvalId]: '' }));
  };

  // Filter content based on active department filter selection
  const filteredNews = news.filter(n => {
    const author = getAuthor(n.AuthorID);
    if (selectedDept === null) return true;
    return author.DepartmentID === selectedDept;
  });

  const getAttendanceStatus = (eventId: number, userId: number): string => {
    const check = attendance.find(a => a.EventID === eventId && a.UserID === userId);
    return check ? check.Status : 'Chưa điểm danh';
  };

  return (
    <div className="max-w-xl mx-auto py-4 select-none font-sans">
      
      {/* 1. Instagram Stories Bar (Department Circle Selectors) */}
      <div 
        id="stories-bar" 
        className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 mb-5 overflow-x-auto scrollbar-hide"
      >
        <button 
          onClick={() => setSelectedDept(null)}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer outline-none focus:outline-none"
        >
          <div 
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl bg-gradient-to-tr ${
              selectedDept === null ? 'from-slate-900 via-slate-700 to-slate-800 p-[3px]' : 'bg-slate-200 p-[1px]'
            }`}
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-slate-800 text-xs">
              All
            </div>
          </div>
          <span className="text-[11px] mt-1 font-bold text-slate-600 truncate max-w-[65px] uppercase tracking-wider">
            Tất cả
          </span>
        </button>

        {departmentStories.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer outline-none focus:outline-none"
          >
            <div 
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl bg-gradient-to-tr ${
                selectedDept === dept.id ? dept.color + ' p-[3px]' : 'from-slate-200 to-slate-300 p-[1px]'
              }`}
            >
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-base">
                {dept.icon}
              </div>
            </div>
            <span className="text-[11px] mt-1 font-bold text-slate-500 truncate max-w-[70px] uppercase tracking-wider">
              {dept.name}
            </span>
          </button>
        ))}
      </div>

      {/* Headline title indicating filtered view */}
      {selectedDept !== null && (
        <div id="filter-indicator" className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-4 py-2 mb-4 text-xs font-medium flex justify-between items-center animate-fade-in">
          <span>Đang lọc bảng tin hoạt động của: <strong className="text-slate-900">{getDeptName(selectedDept)}</strong></span>
          <button 
            onClick={() => setSelectedDept(null)} 
            className="text-slate-400 hover:text-slate-900 font-bold uppercase tracking-wider text-[10px]"
          >
            Xóa lọc
          </button>
        </div>
      )}

      {/* 2. MAIN INSTAGRAM POSTS FEED */}
      <div id="posts-feed" className="flex flex-col gap-6">

        {/* MOCK EVENT CARDS - HIGHLIGHTED AS TOP OF FEED FOR ENGAGEMENT */}
        {events.map((event) => {
          const author = getAuthor(event.CreatedBy);
          const attStatus = getAttendanceStatus(event.EventID, currentUser.UserID);
          const totalPresentCount = attendance.filter(a => a.EventID === event.EventID && a.Status === 'Present').length;
          const totalAbsentCount = attendance.filter(a => a.EventID === event.EventID && a.Status === 'Absent').length;

          // Filter by dept if active
          if (selectedDept !== null && author.DepartmentID !== selectedDept) return null;

          return (
            <article 
              key={event.EventID} 
              id={`event-post-${event.EventID}`} 
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <QrCode size={16} className="text-neutral-700" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1">
                      Mã Sự kiện: CLB-EV-{event.EventID}
                      <span className="font-sans font-normal text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        Sự Kiện Hot
                      </span>
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-medium">Được đăng bởi {author.FullName}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-neutral-400 font-mono">2026-06-12</span>
              </div>

              {/* Graphic Banner illustrating Event */}
              <div className="relative bg-neutral-900 text-white p-6 min-h-[160px] flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80 z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  alt=""
                />
                
                {/* Meta details inside banner */}
                <span className="relative z-20 self-start text-[10px] font-bold px-2.5 py-1 rounded bg-rose-500 text-white uppercase tracking-wider">
                  Sự kiện & Họp mặt CLB
                </span>

                <div className="relative z-20 mt-4">
                  <h3 className="font-sans font-extrabold text-lg text-white leading-tight tracking-tight">
                    {event.EventName}
                  </h3>
                  <div className="flex flex-col gap-1 mt-2 text-neutral-200 text-xs">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-rose-400" /> {event.Location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-yellow-400" /> Lịch diễn ra: {new Date(event.EventDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interaction Details & Description */}
              <div className="p-4">
                <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-3 font-medium">
                  {event.Description}
                </p>

                {/* Live Check-in count bar for everyone */}
                <div className="flex items-center gap-4 text-xs font-bold text-neutral-400 border-t border-neutral-100 pt-3.5 mb-3">
                  <span>Có mặt: <strong className="text-emerald-600 font-bold">{totalPresentCount}</strong></span>
                  <span>Vắng: <strong className="text-red-500 font-bold">{totalAbsentCount}</strong></span>
                </div>

                {/* MEMBER WORKFLOW: QR Check-in scanner simulator */}
                {currentUser.RoleID === RoleID.MEMBER && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 mt-2 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold tracking-tight text-neutral-500 uppercase">
                        Cổng điểm danh (QR Check-in)
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        attStatus === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                        attStatus === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                        attStatus === 'Absent' ? 'bg-rose-100 text-rose-800' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        Tôi: {attStatus}
                      </span>
                    </div>

                    {attStatus === 'Chưa điểm danh' ? (
                      <div>
                        {scanningEventId !== event.EventID ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleStartScanCheckin(event.EventID)}
                              className="flex-1 bg-neutral-900 text-white font-semibold py-2 px-4 rounded-xl text-xs hover:bg-neutral-800 transition flex items-center justify-center gap-2 "
                            >
                              <Camera size={14} />
                              Quét QR Code Điểm Danh
                            </button>
                            <button 
                              onClick={() => setActiveQrModal(event.EventID)}
                              title="Hiển thị QR Code"
                              className="bg-white border border-neutral-300 p-2 rounded-xl text-neutral-700 hover:bg-neutral-50 transition"
                            >
                              <QrCode size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="bg-black text-white p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden h-[120px]">
                            {scanStatus === 'scanning' ? (
                              <>
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-400 animate-pulse transform -translate-y-1/2"></div>
                                <Camera className="animate-spin text-emerald-400 mb-2" size={24} />
                                <span className="text-[11px] text-neutral-300 font-mono animate-pulse">
                                  Đang phát hiện luồng camera & Quét mã QR...
                                </span>
                              </>
                            ) : (
                              <div className="text-center text-emerald-400 flex flex-col items-center justify-center">
                                <CheckCircle2 className="mb-1 text-emerald-400" size={28} />
                                <span className="text-xs font-bold">Quét thành công!</span>
                                <span className="text-[10px] text-neutral-300 font-mono">Đang tải dữ liệu TotalScore...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-emerald-700 bg-emerald-50 text-[11px] font-sans rounded-lg p-2 flex items-center gap-2">
                        <Check size={14} className="text-emerald-600 shrink-0" />
                        <span>Bạn đã hoàn thành điểm danh sự kiện này. Điểm số tương ứng đã cộng gộp!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ADMIN WORKFLOW: Manual Attendance Board for Admins (Trưởng ban or Chủ nhiệm) */}
                {currentUser.RoleID >= RoleID.ADMIN && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 mt-2">
                    <div className="flex justify-between items-center mb-2 pb-2.5 border-b border-neutral-200">
                      <span className="text-[10px] font-sans font-extrabold tracking-wider text-neutral-400 uppercase">
                        Bảng Điểm Danh Thành Viên (Admin Panel)
                      </span>
                      <button 
                        onClick={() => setActiveQrModal(event.EventID)}
                        className="text-[10px] bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-bold flex items-center gap-1"
                      >
                        <QrCode size={10} /> Xem QR
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {allUsers
                        .filter(u => u.RoleID === RoleID.MEMBER) // Only point-accruing members
                        .map(u => {
                          const currentStat = getAttendanceStatus(event.EventID, u.UserID);
                          return (
                            <div key={u.UserID} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-neutral-800">{u.FullName}</span>
                              
                              <div className="flex items-center gap-1">
                                <select
                                  value={currentStat}
                                  onChange={(e) => checkinUser(event.EventID, u.UserID, e.target.value as any)}
                                  className="text-[11px] bg-white border border-neutral-200 rounded px-1 max-w-[120px] font-medium outline-none"
                                >
                                  <option value="Chưa điểm danh">Chưa điểm danh</option>
                                  <option value="Present">Present (+5đ)</option>
                                  <option value="Late">Late (-5đ)</option>
                                  <option value="Absent">Absent (-5đ)</option>
                                  <option value="Excused">Excused (Có phép)</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Mock QR Modal Popup */}
              {activeQrModal === event.EventID && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-neutral-100 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-neutral-900 mb-1">{event.EventName}</h3>
                    <p className="text-xs text-neutral-500 mb-4 text-center">Giao diện QR quét để nhận tự động +5đ tích lũy.</p>
                    
                    {/* QR mock presentation graphic */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mb-4 shadow-sm flex flex-col items-center justify-center relative">
                      <div className="w-48 h-48 border-4 border-neutral-900 p-2 flex items-center justify-center rounded-xl bg-white">
                        <QrCode size={140} className="stroke-[1.5]" />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono mt-2 uppercase tracking-widest">{event.QRCodeUrl}</span>
                    </div>

                    <button
                      onClick={() => setActiveQrModal(null)}
                      className="bg-neutral-900 text-white font-semibold py-2 px-6 rounded-xl text-xs w-full hover:bg-neutral-800 transition"
                    >
                      Đóng QR Code
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {/* 2.5 MEMBER SUBMISSIONS IN THE FEED: WAITING FOR APPROVAL (Bảng tin duyệt minh chứng) */}
        {approvals.map((ap) => {
          const task = tasks.find(t => t.TaskID === ap.TaskID);
          if (!task) return null;
          
          const member = allUsers.find(u => u.UserID === task.AssignedTo);
          const author = getAuthor(task.AssignedBy);

          if (!member) return null;
          if (selectedDept !== null && member.DepartmentID !== selectedDept) return null;

          return (
            <article 
              key={ap.ApprovalID} 
              id={`approval-post-${ap.ApprovalID}`} 
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-neutral-100">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => onViewUserProfile(member.UserID)}
                >
                  <img 
                    src={member.Avatar} 
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100"
                    alt="" 
                  />
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                      {member.FullName}
                      <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 rounded px-1.5 py-0.2 font-mono">
                        Nộp Minh Chứng
                      </span>
                    </h4>
                    <p className="text-[9px] text-neutral-400 font-medium">Nhiệm vụ: {task.TaskName}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ap.Status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                  ap.Status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {ap.Status === 'Approved' ? 'Đã duyệt (+15đ)' : ap.Status === 'Rejected' ? 'Từ chối (-5đ)' : 'Chờ duyệt'}
                </span>
              </div>

              {/* Task Evidence Graphic Banner placeholder */}
              <div className="relative bg-emerald-950 text-white p-5 min-h-[140px] flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70 z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30" 
                  alt=""
                />

                <span className="relative z-20 self-start text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white uppercase tracking-wider font-mono">
                  Link minh chứng đính kèm
                </span>

                <div className="relative z-20 mt-3">
                  <a 
                    href={ap.EvidenceURL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-white hover:underline text-xs flex items-center gap-1 font-semibold truncate max-w-full font-mono bg-white/20 px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    📎 {ap.EvidenceURL}
                  </a>
                </div>
              </div>

              {/* Caption and Interactions */}
              <div className="p-4">
                <div className="mb-3">
                  <span className="font-bold text-xs text-neutral-900 mr-2">{member.FullName.split(' ').pop()}:</span>
                  <span className="text-xs text-neutral-600 font-medium leading-relaxed font-sans">
                    "{ap.EvidenceComment || "Gửi ban chủ nhiệm em đã làm xong nhiệm vụ đúng hạn ạ, mong được phê duyệt!"}"
                  </span>
                </div>

                {ap.Comment && (
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-xs mt-2">
                    <span className="font-bold text-neutral-800 block mb-1">Nhận xét từ Admin:</span>
                    <p className="text-neutral-600 font-medium">"{ap.Comment}"</p>
                  </div>
                )}

                {/* ADMISSIONS EVALUATION PORTAL: ONLY FOR ADMINS AND ON PENDING STATUS */}
                {currentUser.RoleID >= RoleID.ADMIN && ap.Status === 'Pending' && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 mt-3 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={16} className="text-indigo-600" />
                      <span className="text-[11px] font-extrabold text-neutral-400 tracking-wider uppercase font-sans">
                        Cổng Duyệt Dự Án / Điểm Cộng CLB
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mb-3 font-medium">
                      Xét duyệt thành viên sẽ cộng thêm <strong>+15đ</strong> hoặc đóng phạt trừ <strong>-5đ</strong> vào TotalScore. Nhập nhận xét bổ sung:
                    </p>

                    <div className="flex flex-col gap-2">
                      <input 
                        type="text"
                        placeholder="Nhập phản hồi, khen ngợi hoặc lý do từ chối..."
                        value={adminCommentInputs[ap.ApprovalID] || ''}
                        onChange={(e) => setAdminCommentInputs(prev => ({ ...prev, [ap.ApprovalID]: e.target.value }))}
                        className="bg-white border border-neutral-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-400 outline-none w-full"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewTaskEvidence(ap.ApprovalID, true)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl text-xs flex justify-center items-center gap-1.5 transition"
                        >
                          <Check size={14} /> Duyệt Hoàn Thành (+15đ)
                        </button>
                        <button
                          onClick={() => handleReviewTaskEvidence(ap.ApprovalID, false)}
                          className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-semibold py-2 px-3 rounded-xl text-xs flex justify-center items-center gap-1.5 transition"
                        >
                          <X size={14} /> Từ Chối Duyệt (-5đ)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {/* STANDARD INTERACTIVE NEWS & ANNOUNCEMENT POSTS (Bảng tin thông thường) */}
        {filteredNews.map((post) => {
          const author = getAuthor(post.AuthorID);
          const isLiked = post.LikedBy.includes(currentUser.UserID);

          return (
            <article 
              key={post.NewsID} 
              id={`news-post-${post.NewsID}`} 
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-neutral-100">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => onViewUserProfile(author.UserID)}
                >
                  <img 
                    src={author.Avatar} 
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100"
                    alt="" 
                  />
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                      {author.FullName}
                      <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-700 rounded px-1.5 py-0.2 font-mono">
                        {getDeptName(author.DepartmentID).split(' ').pop()}
                      </span>
                    </h4>
                    <p className="text-[9px] text-neutral-400 font-medium">Bản tin hoạt động CLB</p>
                  </div>
                </div>
                <span className="text-[10px] font-sans font-bold text-neutral-400 font-mono">
                  {new Date(post.CreatedDate).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Uploaded content Image */}
              <div className="bg-neutral-100 overflow-hidden aspect-video relative flex items-center justify-center">
                <img 
                  src={post.ImageURL} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
              </div>

              {/* Action Buttons like / comment icons */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-2.5">
                  <button 
                    onClick={() => handleLikePost(post.NewsID)}
                    className="group"
                    title="Yêu thích"
                  >
                    <Heart 
                      size={22} 
                      className={`transition ${
                        isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-neutral-700 hover:text-red-500 hover:scale-110'
                      }`} 
                    />
                  </button>
                  <button className="text-neutral-700 hover:text-indigo-500 transition" title="Bình luận">
                    <MessageSquare size={22} />
                  </button>
                </div>

                {/* Like Count */}
                <div className="font-bold text-xs text-neutral-900 mb-1.5">
                  {post.Likes} lượt thích
                </div>

                {/* Caption / Content with bold title */}
                <div className="mb-4">
                  <p className="font-bold text-xs text-neutral-900 leading-snug uppercase tracking-tight mb-1">
                    {post.Title}
                  </p>
                  <p className="text-xs text-neutral-600 cursor-text leading-relaxed font-sans">
                    {post.Content}
                  </p>
                </div>

                {/* Comments Section list */}
                {post.Comments.length > 0 && (
                  <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2 mb-4">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold">Bình luận</span>
                    <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto">
                      {post.Comments.map((comment) => (
                        <div key={comment.id} className="text-xs flex items-start gap-1">
                          <span className="font-bold text-neutral-800 shrink-0">{comment.userName}:</span>
                          <span className="text-neutral-600 font-medium">{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input block adding comment */}
                <div className="flex items-center gap-2 border-t border-neutral-100 pt-3">
                  <input
                    type="text"
                    placeholder="Thêm bình luận..."
                    value={commentInputs[post.NewsID] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.NewsID]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.NewsID)}
                    className="flex-1 bg-transparent text-xs text-neutral-800 outline-none placeholder-neutral-400"
                  />
                  <button
                    onClick={() => handleAddComment(post.NewsID)}
                    className="text-neutral-900 font-extrabold text-xs tracking-wide hover:text-neutral-600 transition"
                  >
                    Đăng
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {filteredNews.length === 0 && (
          <div className="text-center py-12 bg-white border border-neutral-200 rounded-2xl">
            <ClipboardList className="mx-auto text-neutral-300 mb-2" size={40} />
            <p className="text-xs text-neutral-500 font-semibold">Bảng tin hoạt động hiện chưa có tin bài nào khác của Ban này!</p>
          </div>
        )}
      </div>
    </div>
  );
}
