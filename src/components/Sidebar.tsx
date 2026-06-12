/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, Search, PlusSquare, Bell, User as UserIcon, 
  Layers, Users, ShieldAlert, Award, Star, RefreshCw, LogOut
} from 'lucide-react';
import { User, RoleID } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onChangeUser: (userID: number) => void;
  unreadCount: number;
  onLogout: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentUser,
  allUsers,
  onChangeUser,
  unreadCount,
  onLogout
}: SidebarProps) {
  
  const getRoleLabel = (roleId: RoleID) => {
    switch (roleId) {
      case RoleID.SUPER_ADMIN: return { text: "Chủ nhiệm", color: "bg-red-50 text-red-600 border-red-100" };
      case RoleID.ADMIN: return { text: "Trưởng ban", color: "bg-amber-50 text-amber-600 border-amber-100" };
      default: return { text: "Thành viên", color: "bg-blue-50 text-blue-600 border-blue-100" };
    }
  };

  const currentRole = getRoleLabel(currentUser.RoleID);

  return (
    <>
      {/* Desktop Left Sidebar: Fixed styled inspired by Instagram */}
      <aside 
        id="desktop-sidebar" 
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 border-r border-slate-200 bg-white p-6 z-30 justify-between select-none font-sans"
      >
        <div className="flex flex-col gap-8 w-full">
          {/* Logo Brand Title */}
          <div 
            id="brand-logo" 
            className="flex items-center gap-3.5 py-2 cursor-pointer"
            onClick={() => setCurrentTab('home')}
          >
            <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-center shrink-0">
              <svg 
                viewBox="0 0 100 100" 
                className="w-8 h-8" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="cctGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <filter id="cctGlow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#6366f1" floodOpacity="0.6"/>
                  </filter>
                </defs>
                {/* Interlocking infinity curve */}
                <path 
                  d="M 42,50 C 33,34 16,34 16,50 C 16,66 33,66 42,50 C 51,34 68,34 68,50 C 68,66 51,66 42,50 Z" 
                  stroke="url(#cctGradient)" 
                  strokeWidth="9" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  filter="url(#cctGlow)"
                />
                {/* Futuristic T */}
                <path 
                  d="M 76,36 L 92,36 M 84,36 L 84,64" 
                  stroke="url(#cctGradient)" 
                  strokeWidth="9" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  filter="url(#cctGlow)"
                />
              </svg>
            </div>
            <span className="font-display font-extrabold text-lg tracking-wider text-slate-900 block uppercase">
              CCT - COMTECH
            </span>
          </div>

          {/* Navigation Links */}
          <nav id="sidebar-nav" className="flex flex-col gap-1.5">
            <button
              id="nav-home"
              onClick={() => setCurrentTab('home')}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition text-xs font-bold uppercase tracking-wider ${
                currentTab === 'home'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Home size={18} className={currentTab === 'home' ? 'text-white' : 'text-slate-500'} />
              <span>Bảng tin Hoạt động</span>
            </button>

            <button
              id="nav-explore"
              onClick={() => setCurrentTab('explore')}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition text-xs font-bold uppercase tracking-wider ${
                currentTab === 'explore'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Users size={18} className={currentTab === 'explore' ? 'text-white' : 'text-slate-500'} />
              <span>Bảng vàng & Nhân sự</span>
            </button>

            {/* Create feature accessible to all roles (Members can post evidence/completed tasks, Admins create tasks/events) */}
            <button
              id="nav-create"
              onClick={() => setCurrentTab('create')}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition text-xs font-bold uppercase tracking-wider ${
                currentTab === 'create'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <PlusSquare size={18} className={currentTab === 'create' ? 'text-white' : 'text-slate-500'} />
              <span>{currentUser.RoleID >= RoleID.ADMIN ? 'Tạo mới hoạt động' : 'Nộp minh chứng'}</span>
            </button>

            <button
              id="nav-notifications"
              onClick={() => setCurrentTab('notifications')}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition text-xs relative font-bold uppercase tracking-wider ${
                currentTab === 'notifications'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Bell size={18} className={currentTab === 'notifications' ? 'text-white' : 'text-slate-500'} />
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <span className="absolute right-4 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {currentUser.RoleID >= RoleID.ADMIN && (
              <button
                id="nav-admin"
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition text-xs font-bold uppercase tracking-wider relative ${
                  currentTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <ShieldAlert size={18} className={currentTab === 'admin' ? 'text-white' : 'text-slate-500'} />
                <span>Quản trị & Tích điểm</span>
                <span className="absolute right-4 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              </button>
            )}

            <button
              id="nav-profile"
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition text-xs font-bold uppercase tracking-wider ${
                currentTab === 'profile'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <img 
                src={currentUser.Avatar} 
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                alt="Me" 
              />
              <span>Trang cá nhân</span>
            </button>
          </nav>
        </div>

        {/* Lower Widget: Simulation Switcher (Role Changer) & Profile Display */}
        <div id="simulation-panel" className="flex flex-col gap-4 border-t border-slate-100 pt-5">
          <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                Tài khoản mô phỏng
              </span>
              <RefreshCw className="animate-spin text-slate-400" size={11} />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <img 
                src={currentUser.Avatar} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                alt=""
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.FullName}
                </span>
                <span className="text-[10px] text-slate-400 tracking-tight font-mono">
                  {currentUser.StudentCode}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentRole.color}`}>
                {currentRole.text}
              </span>
              <span className="text-[11px] text-slate-500 font-extrabold font-mono">
                {currentUser.TotalScore}đ
              </span>
            </div>

            <select
              id="user-simulator-select"
              value={currentUser.UserID}
              onChange={(e) => onChangeUser(Number(e.target.value))}
              className="text-xs bg-white text-slate-700 py-1.5 px-2 rounded border border-slate-200 outline-none w-full font-semibold focus:border-slate-400 cursor-pointer mb-2"
            >
              {allUsers.map(u => (
                <option key={u.UserID} value={u.UserID}>
                  {u.FullName} ({u.RoleID === RoleID.SUPER_ADMIN ? 'Chủ nhiệm' : u.RoleID === RoleID.ADMIN ? 'Trưởng ban' : 'Thành viên'})
                </option>
              ))}
            </select>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={11} className="shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center font-mono leading-tight">
            UTC Localtime: 2026-06-12<br />
            Phát triển bởi Ban Kỹ thuật 💻
          </p>
        </div>
      </aside>

      {/* Mobile Top Header: Brand Name and Profile Selector */}
      <header 
        id="mobile-header" 
        className="md:hidden fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between z-40 select-none"
      >
        <div className="flex items-center gap-2.5" onClick={() => setCurrentTab('home')}>
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center justify-center shrink-0">
            <svg 
              viewBox="0 0 100 100" 
              className="w-5 h-5" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cctGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path 
                d="M 42,50 C 33,34 16,34 16,50 C 16,66 33,66 42,50 C 51,34 68,34 68,50 C 68,66 51,66 42,50 Z" 
                stroke="url(#cctGradMobile)" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M 76,36 L 92,36 M 84,36 L 84,64" 
                stroke="url(#cctGradMobile)" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-display font-extrabold text-base tracking-wider text-slate-900 block uppercase">
            CCT - COMTECH
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation Select Dropdown on Top Mobile */}
          <div className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <span className="text-[9px] font-extrabold text-slate-400 mr-1">Vai:</span>
            <select
              value={currentUser.UserID}
              onChange={(e) => onChangeUser(Number(e.target.value))}
              className="text-[10px] bg-transparent text-slate-700 font-bold outline-none border-none p-0 cursor-pointer"
            >
              {allUsers.map(u => (
                <option key={u.UserID} value={u.UserID}>
                  {u.FullName.split(' ').pop()} ({u.RoleID === RoleID.SUPER_ADMIN ? 'Admin' : u.RoleID === RoleID.ADMIN ? 'T.Ban' : 'Mem'})
                </option>
              ))}
            </select>
          </div>

          <button 
            id="mobile-notify"
            onClick={() => setCurrentTab('notifications')}
            className="p-1 relative text-slate-600 hover:text-slate-900"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-slate-900 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          <button 
            onClick={onLogout}
            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg relative transition duration-150 shrink-0"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Menu */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 py-2.5 px-6 flex items-center justify-between z-40 shadow-sm"
      >
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-1 text-xs select-none ${
            currentTab === 'home' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <Home size={20} />
        </button>
 
        <button
          onClick={() => setCurrentTab('explore')}
          className={`flex flex-col items-center gap-1 text-xs select-none ${
            currentTab === 'explore' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <Search size={20} />
        </button>
 
        <button
          onClick={() => setCurrentTab('create')}
          className={`flex flex-col items-center gap-1 text-xs select-none ${
            currentTab === 'create' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <PlusSquare size={20} />
        </button>
 
        <button
          onClick={() => setCurrentTab('notifications')}
          className={`flex flex-col items-center gap-1 text-xs select-none relative ${
            currentTab === 'notifications' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
 
        {currentUser.RoleID >= RoleID.ADMIN && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center gap-1 text-xs select-none ${
              currentTab === 'admin' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <ShieldAlert size={20} />
          </button>
        )}

        <button
          onClick={() => setCurrentTab('profile')}
          className="flex flex-col items-center"
        >
          <img 
            src={currentUser.Avatar} 
            className={`w-5 h-5 rounded-full object-cover ${
              currentTab === 'profile' ? 'ring-2 ring-slate-900' : 'ring-1 ring-slate-200'
            }`}
            alt="" 
          />
        </button>
      </nav>
    </>
  );
}
