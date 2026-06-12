/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, AlertTriangle, ShieldCheck, ClipboardCheck, History, 
  ChevronRight, Calendar, User as UserIcon, Eye, UserMinus, Star, TrendingUp, CheckCircle, Flame,
  Settings, LogOut, Monitor, Smartphone, MapPin, Check, Camera, Info, Lock, Sparkles
} from 'lucide-react';
import { 
  User, ClubEvent, Task, TaskApproval, ScoreHistory, 
  RewardRecord, WarningRecord, DEPARTMENTS, ROLES, RoleID
} from '../types';

interface ProfileSectionProps {
  currentUser: User; // Who is logged in
  viewedUser: User;  // Whose profile is currently showing
  onResetToSelf: () => void;
  tasks: Task[];
  approvals: TaskApproval[];
  scoreHistory: ScoreHistory[];
  rewards: RewardRecord[];
  warnings: WarningRecord[];
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export default function ProfileSection({
  currentUser,
  viewedUser,
  onResetToSelf,
  tasks,
  approvals,
  scoreHistory,
  rewards,
  warnings,
  onLogout,
  onUpdateUser
}: ProfileSectionProps) {

  // Selected tab inside PROFILE (Instagram profile tabs layout)
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'tasks' | 'points' | 'warnings'>('posts');

  // Account Settings Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'personalize' | 'loginActivity'>('personalize');

  // Personalize editing states
  const [editFullName, setEditFullName] = useState(viewedUser.FullName);
  const [editPhone, setEditPhone] = useState(viewedUser.Phone);
  const [editLevel, setEditLevel] = useState(viewedUser.CurrentLevel);
  const [editAvatar, setEditAvatar] = useState(viewedUser.Avatar);
  const [editCover, setEditCover] = useState(viewedUser.Cover || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync states on demand when opening settings
  const handleOpenSettings = () => {
    setEditFullName(viewedUser.FullName);
    setEditPhone(viewedUser.Phone);
    setEditLevel(viewedUser.CurrentLevel);
    setEditAvatar(viewedUser.Avatar);
    setEditCover(viewedUser.Cover || '');
    setSettingsTab('personalize');
    setShowSettingsModal(true);
  };

  const handleSavePersonalization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({
        ...viewedUser,
        FullName: editFullName,
        Phone: editPhone,
        CurrentLevel: editLevel,
        Avatar: editAvatar,
        Cover: editCover
      });
      setIsSaving(false);
      setShowSettingsModal(false);
    }, 600);
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setEditCover(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setEditCover('');
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setEditAvatar(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    // Reset to a beautiful default neutral avatar placeholder
    setEditAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop');
  };

  // Curated list of premium avatars for quick selection
  const PRESET_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  ];

  // Presets for gorgeous space/art backgrounds
  const PRESET_COVERS = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&auto=format&fit=crop&q=80"
  ];

  // Static login logs with dynamic relative labels
  const SIGNIN_ACTIVITIES = [
    { id: 1, device: "Chrome 125.0 (Windows 11)", location: "Thạch Hòa, Hà Nội, Việt Nam", time: "Thiết bị hiện tại (Đang hoạt động)", isMobile: false, current: true, ip: "113.190.22.41" },
    { id: 2, device: "Safari Mobile iPhone 15", location: "Hà Đông, Hà Nội, Việt Nam", time: "Hôm qua lúc 18:42", isMobile: true, current: false, ip: "27.72.189.92" },
    { id: 3, device: "Chrome Mobile Samsung S24", location: "Quận Ngũ Hành Sơn, Đà Nẵng, VN", time: "3 ngày trước", isMobile: true, current: false, ip: "14.232.110.15" }
  ];

  const getDeptName = (deptId: number): string => {
    return DEPARTMENTS.find(d => d.DepartmentID === deptId)?.DepartmentName || "Không trực thuộc";
  };

  const getRoleName = (roleId: number): string => {
    return ROLES.find(r => r.RoleID === roleId)?.RoleName || "Thành viên";
  };

  // User-specific queries
  const userTasks = tasks.filter(t => t.AssignedTo === viewedUser.UserID);
  const completedTasksCount = userTasks.filter(t => t.Status === 'Completed').length;
  
  const userApprovals = approvals.filter(ap => {
    const task = tasks.find(t => t.TaskID === ap.TaskID);
    return task?.AssignedTo === viewedUser.UserID && ap.Status === 'Approved';
  });

  const userRewards = rewards.filter(r => r.UserID === viewedUser.UserID);
  const userWarnings = warnings.filter(w => w.UserID === viewedUser.UserID);
  const userHistories = [...scoreHistory]
    .filter(h => h.UserID === viewedUser.UserID)
    .sort((a, b) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime());

  // Level thresholds and visuals
  const getLevelBadgeStyles = (level: string) => {
    switch (level) {
      case "Kim Cương": return "bg-sky-50 text-sky-700 border-sky-200 ring-sky-100";
      case "Bạch Kim": return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-100";
      case "Vàng": return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100";
      case "Bạc": return "bg-neutral-100 text-neutral-800 border-neutral-300 ring-neutral-200";
      default: return "bg-amber-500/10 text-amber-800 border-amber-500/20 ring-amber-500/10";
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 select-none">
      
      {/* 1. BACK TO SELF PORTRAIT FOR QUICK CONTEXT */}
      {currentUser.UserID !== viewedUser.UserID && (
        <button 
          onClick={onResetToSelf}
          className="bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded px-4 py-2 mb-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-full justify-center transition"
        >
          ← Quay lại xem Hồ Sơ Cá Nhân của tôi ({currentUser.FullName})
        </button>
      )}

      {/* 2. INSTAGRAM BIO HEADER */}
      <div className="bg-white border border-slate-200 rounded-xl mb-5 font-sans overflow-hidden">
        
        {/* Render Cover Banner */}
        <div className="h-32 w-full relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden group">
          {viewedUser.Cover ? (
            <img 
              src={viewedUser.Cover} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              alt="Profile Cover Background" 
            />
          ) : (
            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-slate-350 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=40')` }}>
              <span className="bg-black/40 px-3 py-1.5 rounded backdrop-blur-[2px]">CCT CLUB MEMBER</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="p-6">
          {/* Core details row */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-5 relative z-10">
            {/* Sizable Avatar */}
            <div className="mx-auto sm:mx-0 relative flex-shrink-0">
              <img 
                 src={viewedUser.Avatar} 
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md bg-white" 
                alt={viewedUser.FullName} 
              />
              <span className="absolute -bottom-1 -right-1 text-sm bg-white p-1 rounded-full shadow border border-slate-100">
                ⚡
              </span>
            </div>

          {/* Biography Text block */}
          <div className="flex-1 text-center sm:text-left overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-start">
              <h2 className="font-display font-bold text-lg text-slate-900 truncate uppercase tracking-tight">
                {viewedUser.FullName}
              </h2>
              <span className={`self-center text-[10px] font-bold px-2 py-0.5 rounded border ${getLevelBadgeStyles(viewedUser.CurrentLevel)}`}>
                Lớp: {viewedUser.CurrentLevel}
              </span>
              {viewedUser.UserID === currentUser.UserID && (
                <button 
                  onClick={handleOpenSettings}
                  className="self-center flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[10px] font-extrabold uppercase tracking-wide py-1 px-2.5 rounded-lg border border-slate-200 transition shadow-sm sm:ml-2"
                  id="profile-settings-btn"
                >
                  <Settings size={12} />
                  <span>Cài đặt</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-mono tracking-wide mb-3">
              Mã thành viên: <strong className="text-slate-800 font-bold">{viewedUser.StudentCode}</strong>
            </p>

            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
              <span className="bg-slate-100 px-2.5 py-0.5 rounded border border-slate-250">
                {getRoleName(viewedUser.RoleID)}
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-100">
                {getDeptName(viewedUser.DepartmentID).split(' ').pop()}
              </span>
            </div>

            <div className="text-[10px] text-slate-450 leading-relaxed font-sans">
              📍 CLB Đại học FPT • Gia nhập ngày: {viewedUser.CreatedDate}
            </div>
          </div>
        </div>

        {/* METRICS HIGHLIGHTS ROW */}
        <div className="grid grid-cols-3 gap-2.5 border-t border-slate-100 pt-5 text-center">
          <div className="cursor-pointer hover:bg-slate-50 p-2 rounded transition" onClick={() => setActiveProfileTab('points')}>
            <span className="text-base font-extrabold text-slate-900 block font-mono">
              {viewedUser.TotalScore}đ
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tích Lũy</span>
          </div>

          <div className="cursor-pointer hover:bg-slate-50 p-2 rounded transition" onClick={() => setActiveProfileTab('tasks')}>
            <span className="text-base font-extrabold text-slate-900 block font-mono">
              {completedTasksCount}
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">Nhiệm Vụ Đã Xong</span>
          </div>

          <div className="cursor-pointer hover:bg-slate-50 p-2 rounded transition" onClick={() => setActiveProfileTab('warnings')}>
            <span className="text-base font-extrabold text-slate-900 block font-mono">
              {userRewards.length}
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Được Khen Thưởng</span>
          </div>
        </div>

        {/* Point Gauge Indicator bar */}
        <div className="border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-500">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <TrendingUp size={12} className="text-indigo-500" /> Tiến độ Thăng Lớp
            </span>
            <span className="font-bold text-slate-800">{viewedUser.TotalScore}đ / 200đ</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div 
              style={{ width: `${Math.min(100, (viewedUser.TotalScore / 200) * 100)}%` }}
              className="bg-slate-900 h-full rounded-full transition-all duration-500"
            />
          </div>
          <p className="text-[9px] text-slate-400 italic mt-1 leading-normal font-sans">
            *Đạt mốc 200đ để tự động ghi nhận danh hiệu "Thành viên xuất sắc CLB" và mở rộng dải thăng cấp.
          </p>
        </div>
        </div>
      </div>

      {/* 3. PROFILE TABS CONTROLLER (Matching IG feed visual buttons) */}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-5">
        <div className="flex text-xs font-bold text-neutral-500 border-b border-neutral-100 bg-neutral-50">
          <button 
            onClick={() => setActiveProfileTab('posts')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeProfileTab === 'posts' ? 'border-neutral-900 text-neutral-900 bg-white shadow-inner font-extrabold' : 'border-transparent hover:text-neutral-800'
            }`}
          >
            <ShieldCheck size={14} /> Minh Chứng ({userApprovals.length})
          </button>
          
          <button 
            onClick={() => setActiveProfileTab('tasks')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeProfileTab === 'tasks' ? 'border-neutral-900 text-neutral-900 bg-white shadow-inner font-extrabold' : 'border-transparent hover:text-neutral-800'
            }`}
          >
            <ClipboardCheck size={14} /> Nhiệm Vụ ({userTasks.length})
          </button>

          <button 
            onClick={() => setActiveProfileTab('points')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeProfileTab === 'points' ? 'border-neutral-900 text-neutral-900 bg-white shadow-inner font-extrabold' : 'border-transparent hover:text-neutral-800'
            }`}
          >
            <History size={14} /> Thống Kê Sổ Điểm
          </button>

          <button 
            onClick={() => setActiveProfileTab('warnings')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeProfileTab === 'warnings' ? 'border-neutral-900 text-neutral-900 bg-white shadow-inner font-extrabold' : 'border-transparent hover:text-neutral-800'
            }`}
          >
            <Star size={14} strokeWidth={2.5} /> Khen & Phạt ({userWarnings.length + userRewards.length})
          </button>
        </div>

        {/* TAB PANELS */}
        <div className="p-4 bg-white">
          
          {/* TAB 1: EVIDENCE GRID GALLERY (INSTAGRAM GRID LAYOUT) */}
          {activeProfileTab === 'posts' && (
            <div>
              {userApprovals.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {userApprovals.map((ap) => {
                    const associatedTask = tasks.find(t => t.TaskID === ap.TaskID);
                    return (
                      <div 
                        key={ap.ApprovalID} 
                        className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-250 p-3.5 rounded-xl transition cursor-pointer relative overflow-hidden group min-h-[90px] flex flex-col justify-between"
                      >
                        <span className="text-[14px] leading-tight block font-bold text-neutral-800 font-sans truncate mb-1">
                          {associatedTask?.TaskName || "Nhiệm vụ lẻ"}
                        </span>
                        
                        <p className="text-[10px] text-neutral-400 font-medium line-clamp-2 leading-snug">
                          "{ap.EvidenceComment || "Nộp minh chứng đúng hạn."}"
                        </p>

                        <div className="mt-2.5 flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-2 border-t border-neutral-200">
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5 shrink-0">
                            ✓ +15đ
                          </span>
                          <span className="truncate max-w-[80px]">Duyệt ngày {ap.ApprovedDate?.split('T')[0] || '2026-06-12'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Flame className="mx-auto text-neutral-300 mb-2" size={32} />
                  <p className="text-xs text-neutral-500 font-bold">Chưa có bài nộp nào được phê duyệt.</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Hãy nộp minh chứng và chờ ban chủ nhiệm cộng điểm.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPLICIT TASKS DETAILED WORK LEDGER */}
          {activeProfileTab === 'tasks' && (
            <div className="flex flex-col gap-3">
              {userTasks.map((task) => {
                const isOverdue = new Date(task.Deadline).getTime() < new Date().getTime() && task.Status !== 'Completed';
                const currentStatus = isOverdue ? 'Overdue' : task.Status;

                return (
                  <div 
                    key={task.TaskID}
                    className="border border-neutral-150 rounded-xl p-3 bg-neutral-50 flex items-start justify-between gap-3 "
                  >
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 leading-tight">
                        {task.TaskName}
                        <span className={`text-[9px] px-2 py-0.2 rounded font-sans font-bold ${
                          task.Status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          task.Status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          isOverdue ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.Status === 'Completed' ? 'Đã xong' : task.Status === 'Rejected' ? 'Bị từ chối' : isOverdue ? 'Trễ hạn(-5đ)' : 'Đang làm'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-normal font-medium">{task.Description || "Không có mô tả yêu cầu chi tiết."}</p>
                      
                      <div className="flex gap-4 text-[10px] text-neutral-400 font-mono mt-2 pt-1.5 border-t border-neutral-150/50">
                        <span>Hạn nộp: <strong className="text-neutral-500">{task.Deadline}</strong></span>
                        <span>Người giao: <strong className="text-neutral-500">Ban chủ nhiệm</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {userTasks.length === 0 && (
                <div className="text-center py-10">
                  <ClipboardCheck className="mx-auto text-neutral-300 mb-2" size={32} />
                  <p className="text-xs text-neutral-500 font-bold">Chưa giao bài tập nào khác.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPLETE SCOREHISTORY RECORD HISTORY FLUID ROWS (Section 2.6) */}
          {activeProfileTab === 'points' && (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider pb-1 border-b border-neutral-100 flex justify-between items-center">
                <span>Lịch sử tích lũy (ScoreHistory)</span>
                <span>Thành viên: {viewedUser.FullName}</span>
              </div>

              <div className="flex flex-col divide-y divide-neutral-100 max-h-[220px] overflow-y-auto">
                {userHistories.map((hist) => {
                  const isPositive = hist.ScoreChange >= 0;
                  return (
                    <div key={hist.ScoreID} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="pr-2">
                        <span className="font-semibold text-neutral-800 block text-xs leading-normal">
                          {hist.Reason}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(hist.CreatedDate).toLocaleString('vi-VN')} • Loại: {hist.ReferenceType}
                        </span>
                      </div>
                      
                      <span className={`font-mono font-extrabold text-xs shrink-0 pl-1 ${
                        isPositive ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {isPositive ? '+' : ''}{hist.ScoreChange}đ
                      </span>
                    </div>
                  );
                })}

                {userHistories.length === 0 && (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    Chưa có bất kỳ biến động điểm số nào được ghi nhận.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BADGES RECEIVED AND ACTIVE/RESOLVED WARNINGS */}
          {activeProfileTab === 'warnings' && (
            <div className="flex flex-col gap-4">
              
              {/* Rewards subset Section 2.7 */}
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2.5 block border-b border-neutral-100 pb-1">
                  Khen thưởng & Danh hiệu đạt được (RewardRecords)
                </span>

                {userRewards.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {userRewards.map((reward) => (
                      <div 
                        key={reward.RewardID}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3"
                      >
                        <span className="text-xl">🏆</span>
                        <div>
                          <h4 className="text-xs font-extrabold text-amber-800 font-sans leading-tight">
                            {reward.RewardType}
                          </h4>
                          <p className="text-[11px] text-neutral-600 mt-0.5 leading-normal font-medium">"{reward.Reason}"</p>
                          <span className="text-[10px] font-mono text-neutral-400 mt-1 block">Cấp ngày: {reward.AwardDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 italic">Thành viên chưa đủ mốc vinh danh khen thưởng trong tháng này.</p>
                )}
              </div>

              {/* Warnings subset Section 2.8 */}
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2.5 block border-b border-neutral-100 pb-1">
                  Nhắc Nhở & Cảnh Báo Vi Phạm (WarningRecords)
                </span>

                {userWarnings.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {userWarnings.map((warn) => {
                      const warnConfig = 
                        warn.WarningLevel === 'Mức 3' ? { label: 'Mức 3 - Trao đổi với BCN ngay', style: 'bg-red-50 text-red-950 border-red-200' } :
                        warn.WarningLevel === 'Mức 2' ? { label: 'Mức 2 - Nguy cơ vắng mặt', style: 'bg-amber-50 text-amber-950 border-amber-200' } :
                        { label: 'Mức 1 - Nhắc nhở tích lũy', style: 'bg-neutral-50 text-neutral-900 border-neutral-200' };

                      return (
                        <div 
                          key={warn.WarningID}
                          className={`border rounded-xl p-3 ${warnConfig.style} flex items-start gap-3`}
                        >
                          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                              <h4 className="text-xs font-extrabold">{warnConfig.label}</h4>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                warn.Status === 'Active' ? 'bg-red-200 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {warn.Status === 'Active' ? 'Đang hiệu lực' : 'Đã Khắc Phục (Resolved)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 leading-normal font-medium">"{warn.Reason}"</p>
                            <div className="text-[10px] text-neutral-400 font-mono mt-1.5 pt-1.5 border-t border-neutral-200 flex justify-between">
                              <span>Ngày nhắc: {warn.CreatedDate}</span>
                              {warn.ExpiryDate && <span>Thời hạn: {warn.ExpiryDate}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-xs flex gap-2">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Lịch sử hoàn toàn trong sạch! Thành viên này không có bất kỳ cảnh báo vi phạm nội quy nào đang hiệu lực.</span>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 4. SETTINGS DIALOG POPUP */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-slate-700 animate-spin-slow" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">
                  Thiết lập tài khoản
                </h3>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center transition"
                title="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Inner Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-505">
              <button
                type="button"
                onClick={() => setSettingsTab('personalize')}
                className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${
                  settingsTab === 'personalize' 
                    ? 'border-slate-900 text-slate-950 bg-white font-extrabold' 
                    : 'border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <UserIcon size={14} />
                <span>Personalize</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSettingsTab('loginActivity')}
                className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${
                  settingsTab === 'loginActivity' 
                    ? 'border-slate-900 text-slate-950 bg-white font-extrabold' 
                    : 'border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Monitor size={14} />
                <span>Login Activity</span>
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[50vh]">
              
              {/* TAB 1: PERSONALIZE FORM */}
              {settingsTab === 'personalize' && (
                <form onSubmit={handleSavePersonalization} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-405 block mb-1 uppercase tracking-wider">
                      Họ và Tên thành viên
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-800 text-xs font-bold rounded-lg block w-full p-2.5 outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-405 block mb-1 uppercase tracking-wider">
                        Số điện thoại liên hệ
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-800 text-xs font-bold rounded-lg block w-full p-2.5 outline-none transition"
                        placeholder="Chưa cập nhật"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-405 block mb-1 uppercase tracking-wider">
                        Lớp học / Khóa học
                      </label>
                      <input
                        type="text"
                        value={editLevel}
                        onChange={(e) => setEditLevel(e.target.value)}
                        className="bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-800 text-xs font-bold rounded-lg block w-full p-2.5 outline-none transition"
                        placeholder="Ví dụ: K19"
                      />
                    </div>
                  </div>

                  {/* Custom Profile Cover Background Section */}
                  <div className="border-t border-slate-150 pt-4 mt-4">
                    <label className="text-[10px] font-mono text-slate-405 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
                      <span>Ảnh bìa trang cá nhân (Profile Background)</span>
                      <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-1 font-sans">
                        Sắc nét • 16:9
                      </span>
                    </label>

                    {/* Show current cover thumbnail preview */}
                    {editCover ? (
                      <div className="relative h-20 w-full rounded-xl overflow-hidden mb-3 border border-slate-200">
                        <img src={editCover} className="w-full h-full object-cover" alt="Cover Preview" />
                        <button
                          type="button"
                          onClick={handleRemoveCover}
                          className="absolute top-1.5 right-1.5 bg-red-650 hover:bg-red-700 text-white text-[9px] font-bold uppercase px-2 py-1 rounded transition shadow cursor-pointer"
                        >
                          Gỡ ảnh hiện tại (Remove Current Photo)
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-full rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-[10px] text-slate-450 mb-3 font-medium">
                        Không dùng ảnh bìa (Sử dụng hình vẽ mặc định)
                      </div>
                    )}

                    {/* Preset cover options */}
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {PRESET_COVERS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditCover(url)}
                          className={`relative aspect-[2/1] rounded-lg overflow-hidden border-2 transition ${
                            editCover === url 
                              ? 'border-indigo-600 scale-102 ring-2 ring-indigo-200 shadow-sm' 
                              : 'border-transparent hover:border-slate-350'
                          }`}
                        >
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          {editCover === url && (
                            <div className="absolute inset-0 bg-indigo-600/35 flex items-center justify-center">
                              <Check size={11} className="text-white drop-shadow stroke-[3.5]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Custom File Upload & URL inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[8px] font-mono uppercase tracking-widest text-slate-450 block mb-1">
                          Cách 1: Tải ảnh từ máy tính (Upload Photo)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileUpload}
                          className="text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer block w-full border border-slate-200 rounded p-1 font-sans bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-mono uppercase tracking-widest text-slate-450 block mb-1">
                          Cách 2: Điền liên kết URL ảnh
                        </label>
                        <input
                          type="url"
                          value={editCover}
                          onChange={(e) => setEditCover(e.target.value)}
                          placeholder="https://..."
                          className="bg-slate-50 border border-slate-200 focus:border-slate-405 focus:bg-white text-slate-800 text-[10px] rounded block w-full p-[7px] outline-none transition font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Curated Preset Avatars selector and Centered Upload/Remove Section */}
                  <div className="border-t border-slate-150 pt-4 mt-4 space-y-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-150 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2.5">
                        Ảnh đại diện (Avatar Profile)
                      </span>
                      
                      <div className="relative group w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 flex-shrink-0 mb-3.5 transition-transform duration-350 hover:scale-102">
                        <img 
                          src={editAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'} 
                          className="w-full h-full object-cover" 
                          alt="Avatar preview" 
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                        {/* Upload Button */}
                        <label className="bg-slate-900 hover:bg-slate-950 text-white font-bold py-1.5 px-3 rounded-lg text-[9px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                          <Camera size={12} />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 font-bold py-1.5 px-3 rounded-lg text-[9px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm border border-red-200"
                        >
                          <UserMinus size={12} />
                          <span>Remove Current Photo</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-405 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
                        <span>Chọn ảnh đại diện phong cách</span>
                        <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-1">
                          <Sparkles size={11} className="text-indigo-500 animate-pulse" /> Độc quyền CCT
                        </span>
                      </label>
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {PRESET_AVATARS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditAvatar(url)}
                            className={`relative aspect-square rounded-full overflow-hidden border-2 transition ${
                              editAvatar === url 
                                ? 'border-indigo-600 scale-105 ring-2 ring-indigo-200 shadow-sm' 
                                : 'border-transparent hover:border-slate-300'
                            }`}
                          >
                            <img src={url} className="w-full h-full object-cover" alt="" />
                            {editAvatar === url && (
                              <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                                <Check size={14} className="text-white drop-shadow stroke-[3.5]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Camera size={14} />
                        </div>
                        <input
                          type="url"
                          value={editAvatar}
                          onChange={(e) => setEditAvatar(e.target.value)}
                          placeholder="Hoặc điền URL ảnh đại diện tùy chỉnh của riêng bạn..."
                          className="bg-slate-50 border border-slate-200 focus:border-slate-405 focus:bg-white text-slate-800 text-[10px] rounded-lg block w-full pl-9 p-2 outline-none transition font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition"
                    >
                      Bỏ qua
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-955 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: LOGIN ACTIVITY */}
              {settingsTab === 'loginActivity' && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950 text-[11px] flex gap-2">
                    <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Lịch sử dưới đây ghi nhận lại các phiên đăng nhập hệ thống của tài khoản <strong>{viewedUser.FullName}</strong>. Để bảo mật tối đa, hãy đảm bảo các thiết bị này thuộc quyền sở hữu của bạn.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {SIGNIN_ACTIVITIES.map((act) => (
                      <div key={act.id} className="py-3 flex items-start justify-between gap-3 font-sans">
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-slate-100 p-2 rounded-lg text-slate-600 shrink-0">
                            {act.isMobile ? <Smartphone size={16} /> : <Monitor size={16} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-slate-800">{act.device}</span>
                              {act.current && (
                                <span className="bg-emerald-100 text-emerald-800 text-[8px] font-sans font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                  Hiện tại
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin size={10} className="text-slate-400" />
                              {act.location} • <span className="font-mono">{act.ip}</span>
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-0.5 italic">{act.time}</span>
                          </div>
                        </div>

                        {!act.current && (
                          <button
                            type="button"
                            onClick={() => alert(`Đã kích hoạt yêu cầu đăng xuất khỏi thiết bị này (${act.device}) từ xa thành công.`)}
                            className="text-[9px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition shrink-0"
                          >
                            Đăng xuất
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-150 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-950 text-[10px] font-bold uppercase tracking-wider rounded-lg transition"
                    >
                      Hoàn thành
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Red Double Confirmation zone for Log Out */}
            <div className="bg-red-50 border-t border-red-100 p-4 flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <Lock size={14} className="text-red-500" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-red-700 font-bold">
                  Bảo mật phiên đăng nhập
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onLogout();
                }}
                className="bg-red-600 hover:bg-red-750 text-white font-bold py-1.5 px-3 rounded-lg text-[9px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <LogOut size={11} />
                <span>Đăng xuất (Log Out)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
