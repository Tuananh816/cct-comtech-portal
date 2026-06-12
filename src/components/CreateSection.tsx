/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusSquare, Calendar, ClipboardList, BookOpen, User as UserIcon, Send, 
  CheckCircle2, Link2, MessageSquare, Plus, AlertCircle, Eye, Image
} from 'lucide-react';
import { 
  User, ClubEvent, Task, TaskApproval, News, Announcement, 
  RoleID, DeptID, DEPARTMENTS
} from '../types';

interface CreateSectionProps {
  currentUser: User;
  allUsers: User[];
  events: ClubEvent[];
  tasks: Task[];
  approvals: TaskApproval[];
  news: News[];
  announcements: Announcement[];
  onUpdateDatabase: (updates: {
    events?: ClubEvent[];
    tasks?: Task[];
    approvals?: TaskApproval[];
    news?: News[];
    announcements?: Announcement[];
    notifications?: any[];
  }) => void;
  onSetTab: (tab: string) => void;
}

export default function CreateSection({
  currentUser,
  allUsers,
  events,
  tasks,
  approvals,
  news,
  announcements,
  onUpdateDatabase,
  onSetTab
}: CreateSectionProps) {

  // Active tab inside Creation panel for Admins
  const [activeSubTab, setActiveSubTab] = useState<'news' | 'event' | 'task'>('news');
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);

  // Common preset images for news posts
  const IMAGE_PRESETS = [
    { title: "Sự kiện/Họp mặt", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=80" },
    { title: "Workshop truyền thông", url: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=500&auto=format&fit=crop&q=80" },
    { title: "Team building gắn kết", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&auto=format&fit=crop&q=80" },
    { title: "Thiết kế/UIUX", url: "https://images.unsplash.com/photo-1541462608141-27b2c7452d66?w=500&auto=format&fit=crop&q=80" },
    { title: "Lập trình/Technology", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80" }
  ];

  // News Fields
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState(IMAGE_PRESETS[0].url);

  // Event Fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('2026-06-12T19:00');
  const [eventDesc, setEventDesc] = useState('');

  // Task Fields
  const [taskName, setTaskName] = useState('');
  const [taskAssignee, setTaskAssignee] = useState<number>(
    allUsers.find(u => u.RoleID === RoleID.MEMBER)?.UserID || 4
  );
  const [taskDeadline, setTaskDeadline] = useState('2026-06-18');
  const [taskDesc, setTaskDesc] = useState('');

  // MEMBER EVIDENCE FORM Fields (For Member role)
  const [memberTaskId, setMemberTaskId] = useState<string>('');
  const [memberEvidenceUrl, setMemberEvidenceUrl] = useState('');
  const [memberNotes, setMemberNotes] = useState('');

  // Filter tasks assigned to current member that are NOT yet completed/approved
  const myAssignedTasks = tasks.filter(t => t.AssignedTo === currentUser.UserID && t.Status !== 'Completed');

  // Trigger toast timer
  const flashMessage = (msg: string) => {
    setOutcomeMessage(msg);
    setTimeout(() => {
      setOutcomeMessage(null);
    }, 4000);
  };

  // Submission handles
  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    const newPost: News = {
      NewsID: Date.now(),
      Title: newsTitle,
      Content: newsContent,
      AuthorID: currentUser.UserID,
      CreatedDate: new Date().toISOString(),
      ImageURL: selectedPresetImage,
      Likes: 0,
      LikedBy: [],
      Comments: []
    };

    onUpdateDatabase({ news: [newPost, ...news] });
    
    // Clear
    setNewsTitle('');
    setNewsContent('');
    flashMessage("🎉 Báo cáo thành công! Bài viết đã xuất bản trên Bảng Tin Instagram.");
    setTimeout(() => onSetTab('home'), 1500);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventLocation.trim()) return;

    const newEvent: ClubEvent = {
      EventID: Math.floor(Math.random() * 1000) + 200,
      EventName: eventTitle,
      EventLocation: eventLocation, // Match interface or use location
      Location: eventLocation,
      EventDate: eventDate,
      Description: eventDesc || "Không có mô tả chi tiết.",
      CreatedBy: currentUser.UserID,
      QRCodeUrl: `attendance_event_${Date.now()}_secret`
    } as any;

    onUpdateDatabase({ events: [newEvent, ...events] });

    // Send notifications to all members
    const newNotifications = allUsers.map(u => ({
      NotificationID: Date.now() + Math.random(),
      UserID: u.UserID,
      Title: `Sự kiện mới: ${eventTitle}`,
      Content: `Sự kiện CLB mới được lên lịch tại ${eventLocation}. Hãy chuẩn bị nộp mặt tham dự.`,
      Type: 'Event',
      CreatedDate: new Date().toISOString(),
      IsRead: false
    }));

    onUpdateDatabase({
      events: [newEvent, ...events],
      notifications: newNotifications
    } as any);

    setEventTitle('');
    setEventLocation('');
    setEventDesc('');
    flashMessage("🎉 Khởi tạo sự kiện thành công! QR Code điểm danh đã cập nhật lên bảng tin.");
    setTimeout(() => onSetTab('home'), 1500);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const nextTaskId = Math.max(...tasks.map(t => t.TaskID)) + 1;
    const newTask: Task = {
      TaskID: nextTaskId,
      TaskName: taskName,
      Description: taskDesc,
      AssignedBy: currentUser.UserID,
      AssignedTo: Number(taskAssignee),
      Deadline: taskDeadline,
      Status: 'In Progress'
    };

    const assigneeUser = allUsers.find(u => u.UserID === Number(taskAssignee));

    // Send individual notify 
    const notifyMember = {
      NotificationID: Date.now() + Math.random(),
      UserID: Number(taskAssignee),
      Title: "Nhiệm vụ mới được giao",
      Content: `Bạn vừa được Trưởng ban giao nhiệm vụ: "${taskName}". Hạn chót: ${taskDeadline}.`,
      Type: 'Task',
      CreatedDate: new Date().toISOString(),
      IsRead: false
    };

    onUpdateDatabase({
      tasks: [newTask, ...tasks],
      notifications: [notifyMember]
    });

    setTaskName('');
    setTaskDesc('');
    flashMessage(`🎉 Giao việc thành công cho thành viên ${assigneeUser?.FullName || ''}.`);
    setTimeout(() => onSetTab('profile'), 1500);
  };

  const handleMemberSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberTaskId || !memberEvidenceUrl.trim()) {
      alert("Vui lòng chọn nhiệm vụ và nhập đường dẫn minh chứng!");
      return;
    }

    const tId = Number(memberTaskId);
    const targetTask = tasks.find(t => t.TaskID === tId);
    if (!targetTask) return;

    // 1. Create a task approval entry
    const nextApprovalId = Math.max(...approvals.map(a => a.ApprovalID), 300) + 1;
    const newApproval: TaskApproval = {
      ApprovalID: nextApprovalId,
      TaskID: tId,
      EvidenceURL: memberEvidenceUrl,
      EvidenceComment: memberNotes || "Đã làm xong nhiệm vụ gửi ban chủ nhiệm phê duyệt.",
      Status: 'Pending',
    };

    // 2. Set task state to Completed or in-review?
    // According to workflow, status will pending approval on the home feed.
    const updatedTasks = tasks.map(t => {
      if (t.TaskID === tId) {
        return {
          ...t,
          Status: 'Completed' as const // Tentatively set as complete to signal submission
        };
      }
      return t;
    });

    // Notify Super Admin/Admins
    const admins = allUsers.filter(u => u.RoleID >= RoleID.ADMIN);
    const newNotifications = admins.map(admin => ({
      NotificationID: Date.now() + Math.random(),
      UserID: admin.UserID,
      Title: "Minh chứng nhiệm vụ mới",
      Content: `${currentUser.FullName} vừa nộp minh chứng cho '${targetTask.TaskName}'. Hãy click vào bảng tin để duyệt.`,
      Type: 'Task',
      CreatedDate: new Date().toISOString(),
      IsRead: false
    }));

    onUpdateDatabase({
      approvals: [newApproval, ...approvals],
      tasks: updatedTasks,
      notifications: newNotifications
    });

    setMemberTaskId('');
    setMemberEvidenceUrl('');
    setMemberNotes('');
    flashMessage("🎉 Nộp minh chứng thành công! Tiến trình đã đăng công khai lên Bảng tin để Ban chủ nhiệm xét duyệt.");
    setTimeout(() => onSetTab('home'), 1500);
  };

  return (
    <div className="max-w-xl mx-auto py-4 select-none">
      
      {/* Simulation Feedback Alert */}
      {outcomeMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl mb-4 font-semibold text-center animate-bounce">
          {outcomeMessage}
        </div>
      )}

      {/* ADMIN INTERFACE: News, Event, Task Workspace */}
      {currentUser.RoleID >= RoleID.ADMIN ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-none font-sans">
          {/* Header */}
          <div className="p-5 border-b border-slate-150">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
              <PlusSquare size={18} className="text-slate-800" /> Bảng tạo lập & Điều hành
            </h2>
            <p className="text-[10px] text-slate-400 font-medium font-sans">Tạo tin tức, lên lịch sự kiện hoặc giao nhiệm vụ cho CLB.</p>
          </div>

          {/* Sub menu selectors */}
          <div className="flex border-b border-slate-150 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase tracking-wider">
            <button 
              onClick={() => setActiveSubTab('news')}
              className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
                activeSubTab === 'news' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              <BookOpen size={13} /> Viết Bảng Tin
            </button>
            <button 
              onClick={() => setActiveSubTab('event')}
              className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
                activeSubTab === 'event' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Calendar size={13} /> Tạo Sự Kiện
            </button>
            <button 
              onClick={() => setActiveSubTab('task')}
              className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
                activeSubTab === 'task' ? 'border-slate-900 text-slate-900 bg-white font-extrabold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              <ClipboardList size={13} /> Giao Nhiệm Vụ
            </button>
          </div>

          {/* Panel content form */}
          <div className="p-5">
            
            {/* TAB 1: NEWS */}
            {activeSubTab === 'news' && (
              <form onSubmit={handleCreateNews} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Tiêu Đề Bài Báo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: VINH DANH HOẠT ĐỘNG HOÀN THÀNH XUẤT SẮC THÁNG 5..."
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Nội Dung Bản Tin</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Viết nội dung tin bài chi tiết truyền tải cảm hứng tới thành viên..."
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1.5">Ảnh Minh Họa Cho Post Instagram</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {IMAGE_PRESETS.map((p, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedPresetImage(p.url)}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 relative select-none ${
                          selectedPresetImage === p.url ? 'border-neutral-900 shadow-md scale-[1.02]' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} className="h-14 w-full object-cover" alt="" />
                        <span className="text-[8px] bg-black/60 text-white font-semibold font-mono tracking-wide absolute bottom-0 left-0 w-full text-center py-0.5">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-950 text-white font-semibold py-2 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 mt-2 transition"
                >
                  <Send size={14} /> Xuất Bản Bài Đăng Bảng Tin
                </button>
              </form>
            )}

            {/* TAB 2: EVENTS WITH MOCK QR */}
            {activeSubTab === 'event' && (
              <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Tên Buổi Họp / Sự Kiện</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Họp CLB Tổng kết Công việc tháng 6..."
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Địa Điểm Tổ Chức</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Phòng họp 301, Lab Alpha..."
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Thời Gian Bắt Đầu</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none text-neutral-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Nội Dung / Mô Tả Sự Kiện</label>
                  <textarea 
                    rows={3}
                    placeholder="Yêu cầu tham gia, tài liệu cần chuẩn bị trước..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                  />
                </div>

                <div className="bg-indigo-50 text-indigo-950 p-3.5 rounded-xl border border-indigo-200 text-xs flex gap-2">
                  <AlertCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Lưu ý sinh QR tự động:</strong>
                    <p className="text-indigo-800 font-medium leading-normal mt-0.5">Hệ thống sẽ tự động vẽ đồ họa Mã QR Code điểm danh thích hợp hiển thị thẳng lên trang chủ. Thành viên quét QR này sẽ được nhận 5 điểm tích lũy.</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-950 text-white font-semibold py-2 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 mt-2 transition"
                >
                  <Send size={14} /> Khởi Tạo Sự Kiện & Lấy Mã QR
                </button>
              </form>
            )}

            {/* TAB 3: ASSIGN TASK TO RECRUITS */}
            {activeSubTab === 'task' && (
              <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Tên Nhiệm Vụ Giao Việc</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Thiết kế ấn phẩm Poster ngày Chạy..."
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Gia Giao Cho Thành Viên</label>
                    <select
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(Number(e.target.value))}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none cursor-pointer text-neutral-700 font-medium"
                    >
                      {allUsers
                        .filter(u => u.RoleID === RoleID.MEMBER)
                        .map(member => (
                          <option key={member.UserID} value={member.UserID}>
                            {member.FullName} ({member.StudentCode})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Thời Hạn Hoàn Thành</label>
                    <input 
                      type="date" 
                      required
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none text-neutral-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Chi Tiết Công Việc & Yêu Cầu</label>
                  <textarea 
                    rows={3}
                    placeholder="Yêu cầu xuất định dạng gì, đính kèm kịch bản nào..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-950 text-white font-semibold py-2 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 mt-2 transition"
                >
                  <Send size={14} /> Giao Nhiệm Vụ Học Tập (+15đ)
                </button>
              </form>
            )}

          </div>
        </div>
      ) : (
        /* MEMBER INTERFACE: SUBMIT EVIDENCE DIRECTLY */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-none font-sans">
          {/* Header */}
          <div className="p-5 border-b border-slate-150">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
              <PlusSquare size={18} className="text-slate-800" /> Nộp Minh Chứng Hoàn Thành
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Gửi đường dẫn và thông tin hoàn thành nhiệm vụ để Trưởng ban phê duyệt.</p>
          </div>

          <div className="p-5">
            {myAssignedTasks.length > 0 ? (
              <form onSubmit={handleMemberSubmitEvidence} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Chọn Nhiệm Vụ Giao Nhận</label>
                  <select
                    value={memberTaskId}
                    required
                    onChange={(e) => setMemberTaskId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded py-2.5 px-3 text-xs w-full outline-none cursor-pointer text-slate-700 font-bold"
                  >
                    <option value="">-- Vui lòng chọn bài cần nộp --</option>
                    {myAssignedTasks.map(t => (
                      <option key={t.TaskID} value={t.TaskID}>
                        {t.TaskName} (Hạn: {t.Deadline})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">URL Tài Liệu Minh Chứng (Google Drive / Figma / GitHub)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Link2 size={13} />
                    </span>
                    <input 
                      type="url" 
                      required
                      placeholder="https://drive.google.com/file/d/..."
                      value={memberEvidenceUrl}
                      onChange={(e) => setMemberEvidenceUrl(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded py-2 pl-9 pr-4 text-xs w-full outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-sans">Ghi chú bối cảnh</label>
                  <textarea 
                    rows={4}
                    placeholder="Em đã làm xong thiết kế đúng hạn, gửi anh chị xem mẫu..."
                    value={memberNotes}
                    onChange={(e) => setMemberNotes(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs w-full outline-none resize-none"
                  />
                </div>

                <div className="bg-emerald-50 text-emerald-950 p-3.5 rounded border border-emerald-100 text-[11px] flex gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold uppercase tracking-wider text-[10px]">Quy trình duyệt:</strong>
                    <p className="text-emerald-800 font-medium leading-normal mt-0.5">Sau khi nộp, hệ thống xuất bản minh chứng này lên Bảng Tin Chung của CLB. Khi Trưởng ban duyệt, bạn sẽ nhận được 15 điểm cộng vào TotalScore.</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-4 rounded text-[10px] uppercase tracking-wider flex justify-center items-center gap-1.5 mt-2 transition"
                >
                  <Send size={12} /> Gửi Báo Cáo Phê Duyệt (+15đ)
                </button>
              </form>
            ) : (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded">
                <ClipboardList className="mx-auto text-slate-300 mb-2" size={32} />
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tất cả bài vở đã nộp xong!</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto font-medium">Chúc mừng! Bạn hiện tại không có bất kỳ nhiệm vụ đang thực hiện nào cần phải nộp minh chứng.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
