/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  KeyRound, Mail, UserCheck, Shield, Users, ArrowRight, 
  Sparkles, AlertCircle, CheckCircle2, ChevronLeft, Inbox, 
  UserPlus, Phone, User as UserIcon, Lock, Building2, HelpCircle, Eye, EyeOff
} from 'lucide-react';
import { User, RoleID, RegisterRequest, DeptID, DEPARTMENTS } from '../types';

interface LoginProps {
  users: User[];
  onLoginSuccess: (userId: number) => void;
  registerRequests: RegisterRequest[];
  onRegisterSubmit: (request: RegisterRequest) => void;
}

export default function Login({ users, onLoginSuccess, registerRequests, onRegisterSubmit }: LoginProps) {
  // Navigation sub-state
  const [screen, setScreen] = useState<'login' | 'register' | 'mailbox'>('login');
  
  // Login input states
  const [loginMethod, setLoginMethod] = useState<'studentCode' | 'email'>('studentCode');
  const [inputValue, setInputValue] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStudentCode, setRegStudentCode] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState<DeptID>(DeptID.TRUYEN_THONG);
  const [regSuccess, setRegSuccess] = useState(false);

  // Mailbox inquiry states
  const [mailboxQuery, setMailboxQuery] = useState('');
  const [searchedRequest, setSearchedRequest] = useState<RegisterRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Group accounts for quick simulation select on Login screen
  const adminAccounts = users.filter((u) => u.RoleID >= RoleID.ADMIN);
  const memberAccounts = users.filter((u) => u.RoleID === RoleID.MEMBER);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const sanitized = inputValue.trim().toLowerCase();

    if (!sanitized) {
      setErrorMsg(
        loginMethod === 'studentCode' 
          ? 'Vui lòng nhập Mã số sinh viên (MSSV)!' 
          : 'Vui lòng nhập địa chỉ Email!'
      );
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản!');
      return;
    }

    setLoading(true);

    // Simulate network delay for premium visual immersion
    setTimeout(() => {
      let matchedUser: User | undefined;

      if (loginMethod === 'studentCode') {
        matchedUser = users.find(
          (u) => u.StudentCode.trim().toLowerCase() === sanitized
        );
      } else {
        matchedUser = users.find(
          (u) => u.Email.trim().toLowerCase() === sanitized
        );
      }

      setLoading(false);

      if (matchedUser) {
        // Authenticate password (fallback to default '123456' for existing users without designated passwords)
        const activePassword = matchedUser.Password || "123456";
        if (activePassword === passwordInput) {
          onLoginSuccess(matchedUser.UserID);
        } else {
          setErrorMsg('Mật khẩu bạn nhập không chính xác! Hãy kiểm tra lại.');
        }
      } else {
        setErrorMsg(
          loginMethod === 'studentCode'
            ? 'Không tìm thấy tài khoản có MSSV này hoặc tài khoản chưa được duyệt!'
            : 'Địa chỉ Email chưa đăng ký, chưa được duyệt hoặc không đúng!'
        );
      }
    }, 800);
  };

  const handleQuickLogin = (user: User) => {
    setLoading(true);
    setErrorMsg(null);
    setInputValue(loginMethod === 'studentCode' ? user.StudentCode : user.Email);
    setPasswordInput(user.Password || "123456");
    
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(user.UserID);
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validations
    if (!regName.trim() || !regPhone.trim() || !regStudentCode.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tất cả các trường thông tin đăng ký!');
      return;
    }

    const mssvSanitized = regStudentCode.trim().toUpperCase();
    const emailSanitized = regEmail.trim().toLowerCase();

    // Check if MSSV or Email already in main users
    const existsUser = users.some(u => 
      u.StudentCode.toUpperCase() === mssvSanitized || 
      u.Email.toLowerCase() === emailSanitized
    );

    if (existsUser) {
      setErrorMsg('MSSV hoặc địa chỉ Email này đã tồn tại chính thức trên hệ thống!');
      return;
    }

    // Check if duplicate pending requests
    const existsRequest = registerRequests.some(r => 
      r.Status === 'Pending' && 
      (r.StudentCode.toUpperCase() === mssvSanitized || r.Email.toLowerCase() === emailSanitized)
    );

    if (existsRequest) {
      setErrorMsg('Đang có một hồ sơ đăng ký trùng khớp MSSV hoặc Email đang trong trạng thái chờ duyệt!');
      return;
    }

    // Create a new register request
    const newRequest: RegisterRequest = {
      RequestID: Date.now(),
      FullName: regName.trim(),
      StudentCode: mssvSanitized,
      Email: emailSanitized,
      Phone: regPhone.trim(),
      Password: regPassword,
      DepartmentID: regDept,
      CreatedDate: new Date().toISOString(),
      Status: 'Pending'
    };

    onRegisterSubmit(newRequest);
    setRegSuccess(true);
    
    // Clear registration fields
    setRegName('');
    setRegPhone('');
    setRegStudentCode('');
    setRegEmail('');
    setRegPassword('');
  };

  const handleMailboxSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const query = mailboxQuery.trim().toLowerCase();

    if (!query) {
      setSearchedRequest(null);
      return;
    }

    const matched = registerRequests.find(r => 
      r.StudentCode.toLowerCase() === query || 
      r.Email.toLowerCase() === query ||
      r.FullName.toLowerCase().includes(query)
    );

    setSearchedRequest(matched || null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-7 relative z-15">
        
        {/* Brand/Header (Always Visible) */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-center shrink-0 mb-3">
            <svg 
              viewBox="0 0 100 100" 
              className="w-14 h-14" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="loginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="loginGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#6366f1" floodOpacity="0.8"/>
                </filter>
              </defs>
              <path 
                d="M 42,50 C 33,34 16,34 16,50 C 16,66 33,66 42,50 C 51,34 68,34 68,50 C 68,66 51,66 42,50 Z" 
                stroke="url(#loginGrad)" 
                strokeWidth="9" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                filter="url(#loginGlow)"
              />
              <path 
                d="M 76,36 L 92,36 M 84,36 L 84,64" 
                stroke="url(#loginGrad)" 
                strokeWidth="9" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                filter="url(#loginGlow)"
              />
            </svg>
          </div>
          
          <h1 className="font-display font-extrabold text-xl tracking-widest text-slate-100 uppercase">
            CCT - COMTECH
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase mt-0.5 font-bold">
            PORTAL KHÔNG GIAN THÀNH VIÊN
          </p>
        </div>

        {/* Global form level errors */}
        {errorMsg && (
          <div className="bg-red-950/60 border border-red-900 text-red-300 p-3 rounded-lg text-xs flex items-start gap-2 mb-4 animate-shake">
            <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* SCREEN 1: LOGIN PORTAL */}
        {screen === 'login' && (
          <div className="animate-fade-in">
            {/* Tab switchers login method */}
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-800 mb-4 text-[10px] font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('studentCode');
                  setInputValue('');
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded transition duration-200 ${
                  loginMethod === 'studentCode' 
                    ? 'bg-slate-800 text-slate-100 shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mã Số Sinh Viên
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setInputValue('');
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded transition duration-200 ${
                  loginMethod === 'email' 
                    ? 'bg-slate-800 text-slate-100 shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Địa chỉ Email
              </button>
            </div>

            {/* Login Inputs */}
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
              {/* Field 1: ID / Email */}
              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-extrabold">
                  {loginMethod === 'studentCode' ? 'MÃ SỐ SINH VIÊN (MSSV)' : 'GMAIL / EMAIL HOẠT ĐỘNG'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    {loginMethod === 'studentCode' ? <KeyRound size={14} /> : <Mail size={14} />}
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={loginMethod === 'studentCode' ? 'Ví dụ: HE180123' : 'Ví dụ: tuananh77zt@gmail.com'}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-2 outline-none transition font-sans"
                  />
                </div>
              </div>

              {/* Field 2: Password input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">
                    MẬT KHẨU TÀI KHOẢN
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold font-mono">Demo: 123456</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={14} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs font-bold rounded-lg block w-full pl-9 pr-10 py-2 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold py-2 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-1 transition disabled:opacity-55 cursor-pointer mt-1"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>ĐANG XÁC THỰC...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

            {/* Quick redirection links */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] font-bold">
              <button 
                onClick={() => {
                  setErrorMsg(null);
                  setScreen('register');
                  setRegSuccess(false);
                }}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserPlus size={13} className="text-indigo-400" />
                <span>Tạo tài khoản</span>
              </button>

              <button 
                onClick={() => {
                  setErrorMsg(null);
                  setScreen('mailbox');
                  setMailboxQuery('');
                  setHasSearched(false);
                  setSearchedRequest(null);
                }}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Inbox size={13} className="text-sky-400" />
                <span>Hòm thư duyệt</span>
              </button>
            </div>

            {/* Micro Demo Simulator accounts */}
            <div className="mt-5 pt-4 border-t border-slate-800 animate-fade-in">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" /> SIMULATOR ACCOUNTS (DEMO NHANH)
                </span>
                <span className="text-[8px] text-slate-500">(Auto-fill mật khẩu)</span>
              </div>

              {/* Admin accounts */}
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 tracking-wider uppercase block mb-1 font-bold">
                    🛡️ TRƯỞNG BAN / BAN CHỦ NHIỆM:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {adminAccounts.map((user) => (
                      <button
                        key={user.UserID}
                        onClick={() => handleQuickLogin(user)}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-1.5 rounded-lg flex items-center gap-2 text-left transition text-xs cursor-pointer"
                      >
                        <img 
                          src={user.Avatar} 
                          className="w-5.5 h-5.5 rounded-full object-cover shrink-0 ring-1 ring-slate-800" 
                          alt="" 
                        />
                        <div className="overflow-hidden leading-tight">
                          <span className="text-[10px] font-bold text-slate-100 block truncate">
                            {user.FullName.split(' ').pop()}
                          </span>
                          <span className="text-[7.5px] text-amber-500 block font-mono">
                            {user.RoleID === RoleID.SUPER_ADMIN ? 'Chủ nhiệm' : 'Trưởng ban'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Member accounts */}
                <div>
                  <span className="text-[8px] font-mono text-slate-500 tracking-wider uppercase block mb-1 font-bold">
                    👥 THÀNH VIÊN HOẠT ĐỘNG:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {memberAccounts.map((user) => (
                      <button
                        key={user.UserID}
                        onClick={() => handleQuickLogin(user)}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-1.5 rounded-lg flex flex-col items-center justify-center text-center transition cursor-pointer text-[10px]"
                      >
                        <img 
                          src={user.Avatar} 
                          className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-slate-800" 
                          alt="" 
                        />
                        <span className="text-[9px] font-bold text-slate-200 block truncate w-full mt-0.5">
                          {user.FullName.split(' ').pop()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: CREATE PORTAL ACCOUNT FORM */}
        {screen === 'register' && (
          <div className="animate-fade-in-down">
            {/* Back button */}
            <button 
              onClick={() => {
                setScreen('login');
                setErrorMsg(null);
                setRegSuccess(false);
              }}
              className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 hover:text-slate-200 mb-4 transition bg-slate-950 py-1 px-2.5 rounded-md border border-slate-800 cursor-pointer"
            >
              <ChevronLeft size={12} />
              <span>Quay lại Đăng nhập</span>
            </button>

            {regSuccess ? (
              <div className="bg-slate-950 border border-indigo-900 rounded-xl p-5 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 mb-3 text-indigo-400">
                  <CheckCircle2 size={24} className="animate-bounce" />
                </div>
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">Gửi đăng ký ưu tú thành công!</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4 max-w-xs">
                  Hồ sơ ứng tuyển của bạn đã được chuyển cho Ban nhân sự và Ban chủ nhiệm phê duyệt. <strong className="text-indigo-400">Tài khoản sẽ được tạo ngay khi được duyệt</strong>.
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-left w-full text-[10px] font-mono text-slate-350 leading-relaxed max-w-sm">
                  💡 Bạn có thể đăng nhập thử tài khoản Admin (<strong className="text-amber-400">Tuan Anh / Phong</strong>) để duyệt đơn, sau đó quay lại đăng nhập bằng tài khoản cá nhân của bạn!
                </div>
                <div className="flex gap-2 w-full mt-4">
                  <button
                    onClick={() => {
                      setRegSuccess(false);
                      setScreen('login');
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-extrabold uppercase py-2 rounded-lg cursor-pointer transition font-sans"
                  >
                    Đăng nhập tài khoản demo
                  </button>
                  <button
                    onClick={() => {
                      setMailboxQuery(regStudentCode || '');
                      setScreen('mailbox');
                      setHasSearched(false);
                      setRegSuccess(false);
                    }}
                    className="flex-1 bg-indigo-950 hover:bg-slate-800 text-indigo-300 text-[10px] border border-indigo-900 font-extrabold uppercase py-2 rounded-lg cursor-pointer transition font-sans"
                  >
                    Xem Hòm thư tra cứu
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                  Đăng ký hồ sơ gia nhập clb
                </h2>

                {/* Field 1: Name */}
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-extrabold">Họ và tên thành viên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <UserIcon size={13} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-1.5 outline-none transition font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Field 2: MSSV */}
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-extrabold">Mã sinh viên (MSSV)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <KeyRound size={13} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: HE180123"
                        value={regStudentCode}
                        onChange={(e) => setRegStudentCode(e.target.value)}
                        className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-1.5 outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  {/* Field 3: Phone */}
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-extrabold">Số điện thoại</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone size={13} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Ví dụ: 0912345678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-1.5 outline-none transition font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Field 4: Gmail */}
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-extrabold">Địa chỉ Gmail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail size={13} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Ví dụ: nguyenvala@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-1.5 outline-none transition font-sans"
                    />
                  </div>
                </div>

                {/* Field 5: Password */}
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-extrabold">Mật khẩu đặt cho portal</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock size={13} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Mật khẩu tự chọn"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-1.5 outline-none transition font-sans"
                    />
                  </div>
                </div>

                {/* Field 6: Department ID selection */}
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-extrabold">Khối ban muốn ứng tuyển</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Building2 size={13} />
                    </div>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(Number(e.target.value) as DeptID)}
                      className="bg-slate-950 border border-slate-800 text-slate-205 text-xs font-bold rounded-lg block w-full pl-9 pr-3 py-1.5 outline-none transition cursor-pointer"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.DepartmentID} value={dept.DepartmentID}>
                          {dept.DepartmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
                >
                  <UserPlus size={13} />
                  <span>Nộp đơn đăng ký ứng tuyển</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* SCREEN 3: CHECK APPLICATION STATUS / CORRESPONDENCE INBOX */}
        {screen === 'mailbox' && (
          <div className="animate-fade-in-down">
            {/* Back button */}
            <button 
              onClick={() => {
                setScreen('login');
                setErrorMsg(null);
                setMailboxQuery('');
                setHasSearched(false);
                setSearchedRequest(null);
              }}
              className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 hover:text-slate-200 mb-4 transition bg-slate-950 py-1 px-2.5 rounded-md border border-slate-800 cursor-pointer"
            >
              <ChevronLeft size={12} />
              <span>Quay lại Đăng nhập</span>
            </button>

            <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest block mb-2.5">
              Hòm thư tra cứu đơn tuyển sinh
            </h2>

            <form onSubmit={handleMailboxSearch} className="flex gap-2 mb-4">
              <input 
                type="text"
                required
                value={mailboxQuery}
                onChange={(e) => setMailboxQuery(e.target.value)}
                placeholder="Nhập MSSV hoặc địa chỉ Email của bạn..."
                className="bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 text-xs font-bold rounded-lg block flex-1 px-3 py-2 outline-none transition"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-extrabold uppercase px-4 rounded-lg cursor-pointer transition flex items-center gap-1 shrink-0"
              >
                <Inbox size={12} /> Tra cứu
              </button>
            </form>

            <div className="min-h-[140px] max-h-[300px] overflow-y-auto bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col justify-center">
              {hasSearched ? (
                searchedRequest ? (
                  <div className="text-left animate-fade-in flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">
                        ĐƠN ĐĂNG KÍ: #{searchedRequest.RequestID}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        searchedRequest.Status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        searchedRequest.Status === 'Approved' ? 'bg-emerald-500/10 text-emerald-550 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-550/20'
                      }`}>
                        {searchedRequest.Status === 'Pending' ? 'CHỜ DUYỆT' :
                         searchedRequest.Status === 'Approved' ? 'ĐÃ PHÊ DUYỆT' : 'BỊ TỪ CHỐI'}
                      </span>
                    </div>

                    {searchedRequest.Status === 'Pending' && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase mb-1">
                          ✉️ THƯ NHẬN ĐƠN: ĐANG TRONG TIẾN TRÌNH THẨM ĐỊNH
                        </h4>
                        <p className="text-[12px] text-slate-350 leading-relaxed font-sans pt-1">
                          Dear <strong>{searchedRequest.FullName}</strong> ({searchedRequest.StudentCode}),<br /><br />
                          Ban Nhân Sự trân trọng thông báo đơn đăng ký ứng tuyển gia nhập **Ban Tổ chức / Công nghệ** của bạn đã được tiếp nhận thành công vào lúc {new Date(searchedRequest.CreatedDate).toLocaleDateString('vi-VN')}.<br /><br />
                          Hiện tại hồ sơ đang chờ Ban chủ nhiệm duyệt. Vui lòng chờ kết quả chính thức tại hòm thư này.
                        </p>
                      </div>
                    )}

                    {searchedRequest.Status === 'Approved' && (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-900 rounded-lg">
                        <main className="text-xs text-indigo-200">
                          <h4 className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase mb-2">
                            🎉 THƯ MỜI GIA NHẬP: CHÚC MỪNG BẠN ĐÃ ĐỖ CLB CCT-COMTECH!
                          </h4>
                          <p className="text-[12px] text-slate-300 leading-relaxed font-sans">
                            Xin chào <strong>{searchedRequest.FullName}</strong>,<br /><br />
                            Chúng tôi vô cùng vui mừng báo tin hồ sơ ứng tuyển của bạn đã được <strong>Phê duyệt chính thức</strong> bởi Ban chủ nhiệm! Tài khoản của bạn đã được tạo lập thành công trên CRM.<br /><br />
                            Giờ đây, bạn có thể quay lại màn hình chính của Portal, nhập <strong>MSSV ({searchedRequest.StudentCode})</strong> hoặc <strong>Email ({searchedRequest.Email})</strong>, điền mật khẩu đã đăng ký để bắt đầu hành trình đóng góp & tích lũy điểm thưởng!<br /><br />
                            Chào mừng đồng đội mới!
                          </p>
                        </main>
                      </div>
                    )}

                    {searchedRequest.Status === 'Rejected' && (
                      <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                        <div className="text-xs text-red-200">
                          <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase mb-2">
                            ✉️ THƯ PHẢN HỒI: QUYẾT ĐỊNH ĐƠN TUYỂN SINH
                          </h4>
                          <p className="text-[12px] text-slate-300 leading-relaxed font-sans">
                            Dear <strong>{searchedRequest.FullName}</strong>,<br /><br />
                            Cảm ơn bạn đã đầu tư thời gian ứng tuyển và nộp đơn đăng ký tham gia vào CLB CCT-COMTECH.<br /><br />
                            Sau khi họp bàn và định đoạt chỉ tiêu kỹ thuật/nhân sự, Ban chủ nhiệm vô cùng tiếc nuối khi chưa thể đón tiếp bạn tham gia CLB trong đợt này.<br /><br />
                            <strong>Lý do từ chối phản hồi từ Ban chủ nhiệm:</strong><br />
                            <span className="text-red-400 bg-red-950/50 p-2 border border-red-900 rounded block mt-1.5 font-bold">
                              ❌ {searchedRequest.RejectReason || "Hồ sơ chưa đạt tiêu chí kỹ thuật / hoặc chưa khớp chỉ tiêu tuyển chọn."}
                            </span>
                            <br />
                            Chúc bạn gặt hái được nhiều thành công trên con đường kế tiếp.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    <p className="font-bold">❌ Không tìm thấy hồ sơ đăng ký!</p>
                    <p className="mt-1 leading-normal text-[11px] text-slate-500 max-w-xs mx-auto">
                      Hãy chắc chắn rằng bạn đã nhập đúng địa chỉ Email hoặc Mã số sinh viên (MSSV) đã ghi trên form.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center">
                  <Inbox size={26} className="text-slate-600 mb-1.5" />
                  <p className="font-bold uppercase tracking-wider text-[11px]">Tra cứu trạng thái đơn thư & hòm thư từ Chối/Duyệt</p>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-normal mt-1">
                    Nhập MSSV hoặc Email của bạn vào ô tìm kiếm phía trên để kiểm tra ngay xem đơn đăng ký đã được Admin phê duyệt hay chưa.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <div className="mt-6 text-center text-slate-500 text-[10px] font-mono tracking-wider">
        PLATFORM ĐIỂM SỐ TIÊU CHUẨN • BAN KỸ THUẬT CCT - COMTECH
      </div>
    </div>
  );
}
