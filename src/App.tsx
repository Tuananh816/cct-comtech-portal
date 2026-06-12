/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, Star, AlertTriangle, ShieldAlert, Heart, 
  Trash2, Sparkles, RefreshCw, Layers, Check, Info, Calendar
} from 'lucide-react';

import { 
  User, ClubEvent, Attendance, Task, TaskApproval, ScoreHistory, 
  RewardRecord, WarningRecord, News, Announcement, Notification, RoleID, RegisterRequest
} from './types';

import { 
  KEYS, getSavedData, saveToStorage, initializeDatabase, runAutomatedScheduler
} from './data/store';

import Sidebar from './components/Sidebar';
import FeedSection from './components/FeedSection';
import ExploreSection from './components/ExploreSection';
import CreateSection from './components/CreateSection';
import ProfileSection from './components/ProfileSection';
import AdminSection from './components/AdminSection';
import Login from './components/Login';

export default function App() {
  // Ensure storage is pre-populated
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Primary Database States
  const [users, setUsers] = useState<User[]>(() => getSavedData(KEYS.USERS, []));
  const [events, setEvents] = useState<ClubEvent[]>(() => getSavedData(KEYS.EVENTS, []));
  const [attendance, setAttendance] = useState<Attendance[]>(() => getSavedData(KEYS.ATTENDANCE, []));
  const [tasks, setTasks] = useState<Task[]>(() => getSavedData(KEYS.TASKS, []));
  const [approvals, setApprovals] = useState<TaskApproval[]>(() => {
    const data = getSavedData<TaskApproval[]>(KEYS.APPROVALS, []);
    if (data.length === 0) return [];
    if (!data.some(ap => ap.TaskID === 202)) {
      const healItem: TaskApproval = {
        ApprovalID: 303,
        TaskID: 202,
        EvidenceURL: "https://github.com/baopq/instagram-profile-clb",
        EvidenceComment: "Em đã hoàn thành lập trình giao diện hồ sơ thành viên chuẩn phong cách Instagram, tích hợp điểm số & khen thưởng. Nhờ anh/chị xem xét phê duyệt ạ!",
        Status: 'Pending'
      };
      const healed = [healItem, ...data];
      saveToStorage(KEYS.APPROVALS, healed);
      return healed;
    }
    return data;
  });
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>(() => getSavedData(KEYS.HISTORY, []));
  const [rewards, setRewards] = useState<RewardRecord[]>(() => getSavedData(KEYS.REWARDS, []));
  const [warnings, setWarnings] = useState<WarningRecord[]>(() => getSavedData(KEYS.WARNINGS, []));
  const [news, setNews] = useState<News[]>(() => getSavedData(KEYS.NEWS, []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => getSavedData(KEYS.ANNOUNCEMENTS, []));
  const [notifications, setNotifications] = useState<Notification[]>(() => getSavedData(KEYS.NOTIFICATIONS, []));
  const [registerRequests, setRegisterRequests] = useState<RegisterRequest[]>(() => getSavedData<RegisterRequest[]>('clb_register_requests', []));

  // Simulation parameters
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    const saved = localStorage.getItem(KEYS.CURRENT_USER_ID);
    return saved ? Number(saved) : 4; // Default to Member - Phạm Quốc Bảo
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('clb_is_logged_in') === 'true';
  });

  // Navigation states
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [viewedUserId, setViewedUserId] = useState<number | null>(null);

  // Scheduler Result logs modal state
  const [schedulerOutcome, setSchedulerOutcome] = useState<{
    open: boolean;
    notificationsAdded: number;
    warningsAdded: number;
    warningsResolved: number;
    rewardsAdded: number;
    logs: string[];
  } | null>(null);

  // Sync state mutations helper
  const handleUpdateDatabase = (updates: {
    users?: User[];
    events?: ClubEvent[];
    attendance?: Attendance[];
    tasks?: Task[];
    approvals?: TaskApproval[];
    scoreHistory?: ScoreHistory[];
    rewards?: RewardRecord[];
    warnings?: WarningRecord[];
    news?: News[];
    announcements?: Announcement[];
    notifications?: Notification[];
    registerRequests?: RegisterRequest[];
  }) => {
    if (updates.users) {
      setUsers(updates.users);
      saveToStorage(KEYS.USERS, updates.users);
    }
    if (updates.registerRequests) {
      setRegisterRequests(updates.registerRequests);
      saveToStorage('clb_register_requests', updates.registerRequests);
    }
    if (updates.events) {
      setEvents(updates.events);
      saveToStorage(KEYS.EVENTS, updates.events);
    }
    if (updates.attendance) {
      setAttendance(updates.attendance);
      saveToStorage(KEYS.ATTENDANCE, updates.attendance);
    }
    if (updates.tasks) {
      setTasks(updates.tasks);
      saveToStorage(KEYS.TASKS, updates.tasks);
    }
    if (updates.approvals) {
      setApprovals(updates.approvals);
      saveToStorage(KEYS.APPROVALS, updates.approvals);
    }
    if (updates.scoreHistory) {
      setScoreHistory(updates.scoreHistory);
      saveToStorage(KEYS.HISTORY, updates.scoreHistory);
    }
    if (updates.rewards) {
      setRewards(updates.rewards);
      saveToStorage(KEYS.REWARDS, updates.rewards);
    }
    if (updates.warnings) {
      setWarnings(updates.warnings);
      saveToStorage(KEYS.WARNINGS, updates.warnings);
    }
    if (updates.news) {
      setNews(updates.news);
      saveToStorage(KEYS.NEWS, updates.news);
    }
    if (updates.announcements) {
      setAnnouncements(updates.announcements);
      saveToStorage(KEYS.ANNOUNCEMENTS, updates.announcements);
    }
    if (updates.notifications) {
      // Append instead of overwrite for maximum fluidity
      const augmented = [...updates.notifications, ...notifications].slice(0, 50);
      setNotifications(augmented);
      saveToStorage(KEYS.NOTIFICATIONS, augmented);
    }
  };

  const handleUpdateDirectNotifications = (fullNotificationsList: Notification[]) => {
    setNotifications(fullNotificationsList);
    saveToStorage(KEYS.NOTIFICATIONS, fullNotificationsList);
  };

  // Switch simulated account
  const handleChangeUser = (userId: number) => {
    setCurrentUserId(userId);
    localStorage.setItem(KEYS.CURRENT_USER_ID, String(userId));
    setViewedUserId(null); // Look at new own profile
  };

  const handleLoginSuccess = (userId: number) => {
    setCurrentUserId(userId);
    localStorage.setItem(KEYS.CURRENT_USER_ID, String(userId));
    localStorage.setItem('clb_is_logged_in', 'true');
    setIsLoggedIn(true);
    setCurrentTab('home');
    setViewedUserId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('clb_is_logged_in');
    setIsLoggedIn(false);
  };

  // Open clicked member's personal portfolio
  const handleViewUserProfile = (userId: number) => {
    setViewedUserId(userId);
    setCurrentTab('profile');
  };

  const handleResetProfileToSelf = () => {
    setViewedUserId(null);
  };

  // Scheduler click handler (2.8.1)
  const handleTriggerAutomatedScheduler = () => {
    const {
      updatedUsers,
      updatedWarnings,
      updatedRewards,
      updatedNotifications,
      result
    } = runAutomatedScheduler(users, attendance, warnings, rewards, notifications);

    // Save outputs
    setUsers(updatedUsers);
    saveToStorage(KEYS.USERS, updatedUsers);

    setWarnings(updatedWarnings);
    saveToStorage(KEYS.WARNINGS, updatedWarnings);

    setRewards(updatedRewards);
    saveToStorage(KEYS.REWARDS, updatedRewards);

    setNotifications(updatedNotifications);
    saveToStorage(KEYS.NOTIFICATIONS, updatedNotifications);

    setSchedulerOutcome({
      open: true,
      ...result
    });
  };

  const handleClearNotifications = () => {
    const cleared = notifications.map(n => ({ ...n, IsRead: true }));
    setNotifications(cleared);
    saveToStorage(KEYS.NOTIFICATIONS, cleared);
  };

  // Active simulated user node
  const activeUserNode = users.find(u => u.UserID === currentUserId) || users[0];
  const viewedUserNode = viewedUserId ? (users.find(u => u.UserID === viewedUserId) || activeUserNode) : activeUserNode;

  // Global unread notifications count
  const unreadCount = notifications.filter(n => n.UserID === currentUserId && !n.IsRead).length;

  if (!isLoggedIn) {
    return (
      <Login 
        users={users} 
        onLoginSuccess={handleLoginSuccess} 
        registerRequests={registerRequests}
        onRegisterSubmit={(newReq) => {
          const updated = [newReq, ...registerRequests];
          setRegisterRequests(updated);
          saveToStorage('clb_register_requests', updated);
        }}
      />
    );
  }

  return (
    <div id="full-app-root" className="min-h-screen bg-slate-50 text-neutral-800 font-sans antialiased flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* 1. Left Sidebar Navigation */}
      {activeUserNode && (
        <Sidebar 
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab === 'admin' && activeUserNode.RoleID < RoleID.ADMIN) {
              return; // block tab transition
            }
            setCurrentTab(tab);
            if (tab !== 'profile') setViewedUserId(null); // Reset profile target when steering away
          }}
          currentUser={activeUserNode}
          allUsers={users}
          onChangeUser={handleChangeUser}
          unreadCount={unreadCount}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Main content block viewport container */}
      <main id="main-content-viewport" className="flex-1 md:ml-64 px-4 pt-16 md:pt-4 pb-10 transition-all duration-300">
        
        {/* TAB 1: BẢNG TIN HOẠT ĐỘNG */}
        {currentTab === 'home' && activeUserNode && (
          <FeedSection 
            currentUser={activeUserNode}
            allUsers={users}
            events={events}
            attendance={attendance}
            tasks={tasks}
            approvals={approvals}
            news={news}
            scoreHistory={scoreHistory}
            onUpdateDatabase={handleUpdateDatabase}
            onViewUserProfile={handleViewUserProfile}
          />
        )}

        {/* TAB 2: BẢNG VÀNG & NHÂN SỰ */}
        {currentTab === 'explore' && activeUserNode && (
          <ExploreSection 
            currentUser={activeUserNode}
            allUsers={users}
            onUpdateDatabase={(ups) => handleUpdateDatabase(ups)}
            onViewUserProfile={handleViewUserProfile}
          />
        )}

        {/* TAB 3: TẠO MỚI (Bài nộp hoặc Giao nhiệm vụ) */}
        {currentTab === 'create' && activeUserNode && (
          <CreateSection 
            currentUser={activeUserNode}
            allUsers={users}
            events={events}
            tasks={tasks}
            approvals={approvals}
            news={news}
            announcements={announcements}
            onUpdateDatabase={handleUpdateDatabase}
            onSetTab={setCurrentTab}
          />
        )}

        {/* TAB 4: THÔNG BÁO (Instagram Heart Activity Stream) */}
        {currentTab === 'notifications' && activeUserNode && (
          <div className="max-w-xl mx-auto py-4 select-none animate-fade-in">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-neutral-100">
                <div>
                  <h2 className="font-sans font-extrabold text-lg text-neutral-900 flex items-center gap-1.5 leading-tight">
                    <Heart size={18} className="text-red-500 fill-red-500 shrink-0" /> Bảng tin Hoạt Động CLB
                  </h2>
                  <p className="text-[11px] text-neutral-400">Các cập nhật quan trọng và cảnh báo trực tiếp từ bộ lập lịch.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearNotifications}
                    className="text-[11px] border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-xl font-bold text-neutral-600 transition"
                  >
                    Đã đọc tất cả
                  </button>

                  <button
                    onClick={handleTriggerAutomatedScheduler}
                    className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0"
                    title="Chạy phân tích điểm và tự động phát cảnh báo theo thiết lập"
                  >
                    <RefreshCw size={11} /> Chạy Lập Lịch
                  </button>
                </div>
              </div>

              {/* AUTOMATED MONITORING INSTRUCTIONS BANNER */}
              <div className="bg-indigo-50 border border-indigo-150 p-3.5 rounded-xl text-neutral-700 flex gap-2.5 mb-4 text-xs">
                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-indigo-950 font-sans block mb-0.5">Cơ chế tự động đánh giá (Scheduler)</strong>
                  <p className="text-indigo-800 font-medium leading-normal">
                    Khi click "Chạy Lập Lịch", hệ thống giả lập tác vụ định kỳ của Ban chủ nhiệm: tự động quét TotalScore & Điểm danh thành viên. Tự động sinh <strong className="font-bold">Khen thưởng</strong> (nếu điểm ≥ 200) hoặc phát <strong className="font-bold">Cảnh báo Mức 1, 2, 3</strong> (nếu nợ nần điểm số / trốn họp quá quy định).
                  </p>
                </div>
              </div>

              {/* Alerts history feed */}
              <div className="flex flex-col divide-y divide-neutral-100 max-h-[350px] overflow-y-auto pr-1">
                {notifications
                  .filter(n => n.UserID === currentUserId)
                  .map((notif) => {
                    const iconStyle = 
                      notif.Type === 'Warning' ? { icon: <AlertTriangle size={15} />, color: 'bg-red-50 text-red-600 border-red-100' } :
                      notif.Type === 'Reward' ? { icon: <Star size={15} />, color: 'bg-amber-50 text-amber-600 border-amber-100' } :
                      notif.Type === 'Event' ? { icon: <Calendar size={15} />, color: 'bg-blue-50 text-blue-600 border-blue-100' } :
                      { icon: <CheckCircle2 size={15} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };

                    return (
                      <div 
                        key={notif.NotificationID} 
                        className={`py-3.5 flex items-start gap-3 transition ${
                          !notif.IsRead ? 'bg-neutral-50/50 px-2 rounded-xl' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-semibold shrink-0 ${iconStyle.color}`}>
                          {iconStyle.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="text-xs font-extrabold text-neutral-900 leading-tight">
                              {notif.Title}
                            </h4>
                            {!notif.IsRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 font-medium leading-relaxed font-sans">{notif.Content}</p>
                          <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                            {new Date(notif.CreatedDate).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {notifications.filter(n => n.UserID === currentUserId).length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="text-xs text-neutral-500 font-bold">Chưa có thông báo hoạt động nào mới.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HỒ SƠ CÁ NHÂN (Instagram Profile layout) */}
        {currentTab === 'profile' && activeUserNode && viewedUserNode && (
          <ProfileSection 
            currentUser={activeUserNode}
            viewedUser={viewedUserNode}
            onResetToSelf={handleResetProfileToSelf}
            tasks={tasks}
            approvals={approvals}
            scoreHistory={scoreHistory}
            rewards={rewards}
            warnings={warnings}
            onLogout={handleLogout}
            onUpdateUser={(updatedUser) => {
              const nextUsers = users.map(u => u.UserID === updatedUser.UserID ? updatedUser : u);
              setUsers(nextUsers);
              localStorage.setItem('clb_users', JSON.stringify(nextUsers));
            }}
          />
        )}

        {/* TAB 6: BAN QUẢN TRỊ & ĐIỀU HÀNH */}
        {currentTab === 'admin' && activeUserNode && activeUserNode.RoleID >= RoleID.ADMIN && (
          <AdminSection 
            currentUser={activeUserNode}
            allUsers={users}
            events={events}
            tasks={tasks}
            approvals={approvals}
            scoreHistory={scoreHistory}
            onUpdateDatabase={handleUpdateDatabase}
            onViewUserProfile={handleViewUserProfile}
            registerRequests={registerRequests}
          />
        )}

      </main>

      {/* 3. SCHEDULER OUTPUT POPUP LOG DIALOG */}
      {schedulerOutcome && schedulerOutcome.open && (
        <div id="scheduler-outcome-dialog" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-neutral-100 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100">
              <Sparkles className="text-amber-500 fill-amber-500 animate-pulse" size={20} />
              <h3 className="text-sm font-extrabold text-neutral-900 font-sans uppercase">
                Nhật Ký Bộ Lập Lịch Đánh Giá CLB
              </h3>
            </div>

            <p className="text-xs text-neutral-600 mb-4 leading-relaxed font-sans">
              Bộ quét tự động đánh giá đã phân tích xong toàn bộ thành viên. Các kết quả thống kê tương ứng:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-bold text-center">
              <div className="bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-100">
                <span className="text-sm block font-mono">{schedulerOutcome.warningsAdded}</span>
                <span className="text-[10px] text-red-500 font-normal block">Cảnh báo phát mới</span>
              </div>
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-sm block font-mono">{schedulerOutcome.warningsResolved}</span>
                <span className="text-[10px] text-emerald-500 font-normal block">Cảnh báo gỡ bỏ</span>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 mb-5 max-h-[160px] overflow-y-auto">
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-neutral-400 block mb-1.5 pb-1 border-b border-neutral-200">
                Nhật ký vận hành chi tiết:
              </span>
              <ul className="flex flex-col gap-1.5">
                {schedulerOutcome.logs.map((logStr, index) => (
                  <li key={index} className="text-xs font-medium text-neutral-600 leading-snug flex items-start gap-1">
                    <span className="text-indigo-500 text-xs shrink-0">•</span> {logStr}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setSchedulerOutcome(null);
                setCurrentTab('notifications'); // Steering into heart tab to check alerts
              }}
              className="bg-neutral-900 hover:bg-neutral-950 text-white font-semibold py-2.5 px-4 rounded-xl text-xs w-full transition shadow-md"
            >
              xác nhận & xem thông báo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
