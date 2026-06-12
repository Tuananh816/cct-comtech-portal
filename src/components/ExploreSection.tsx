/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, Users, Star, Award, Shield, Trash2, Plus, X, 
  Mail, Phone, Calendar, Check, Edit, CheckCircle2, UserPlus, Filter
} from 'lucide-react';
import { User, RoleID, DeptID, DEPARTMENTS, ROLES } from '../types';
import { getLevelName } from '../data/store';

interface ExploreSectionProps {
  currentUser: User;
  allUsers: User[];
  onUpdateDatabase: (updates: { users?: User[] }) => void;
  onViewUserProfile: (userId: number) => void;
}

export default function ExploreSection({
  currentUser,
  allUsers,
  onUpdateDatabase,
  onViewUserProfile
}: ExploreSectionProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<User | null>(null);

  // Form Fields for Add
  const [newFullName, setNewFullName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState<number>(DeptID.KY_THUAT);
  const [newRole, setNewRole] = useState<number>(RoleID.MEMBER);
  const [newScore, setNewScore] = useState(100);

  // Form Fields for Edit
  const [editFullName, setEditFullName] = useState('');
  const [editStudentCode, setEditStudentCode] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState<number>(DeptID.KY_THUAT);
  const [editRole, setEditRole] = useState<number>(RoleID.MEMBER);
  const [editScore, setEditScore] = useState(100);
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');

  // Sorted leaderboard by Score descending
  const sortedLeaderboard = [...allUsers]
    .filter(u => u.RoleID === RoleID.MEMBER || u.RoleID === RoleID.ADMIN) // exclude Super Admin optionally or rank all
    .sort((a, b) => b.TotalScore - a.TotalScore);

  // Filtered members list
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.FullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.StudentCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === null ? true : u.DepartmentID === selectedDept;
    return matchesSearch && matchesDept;
  });

  const getDeptName = (deptId: number): string => {
    return DEPARTMENTS.find(d => d.DepartmentID === deptId)?.DepartmentName || "Không xác định";
  };

  const getRoleName = (roleId: number): string => {
    return ROLES.find(r => r.RoleID === roleId)?.RoleName || "Thành viên";
  };

  const handleOpenEditModal = (user: User) => {
    setShowEditModal(user);
    setEditFullName(user.FullName);
    setEditStudentCode(user.StudentCode);
    setEditEmail(user.Email);
    setEditPhone(user.Phone);
    setEditDept(user.DepartmentID);
    setEditRole(user.RoleID);
    setEditScore(user.TotalScore);
    setEditStatus(user.Status);
  };

  const handleAddNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newStudentCode.trim() || !newEmail.trim()) {
      alert("Vui lòng nhập đầy đủ Họ tên, MSSV, và Email.");
      return;
    }

    // Generate random avatar preset based on male or female names
    const randomSeed = Math.floor(Math.random() * 100);
    const avatarGender = newFullName.toLowerCase().includes('thị') || newFullName.toLowerCase().includes('mai') || newFullName.toLowerCase().includes('lan') || newFullName.toLowerCase().includes('vy') ? 'women' : 'men';
    const mockAvatar = `https://randomuser.me/api/portraits/${avatarGender}/${randomSeed}.jpg`;

    const nextId = Math.max(...allUsers.map(u => u.UserID)) + 1;
    const newMember: User = {
      UserID: nextId,
      StudentCode: newStudentCode.toUpperCase(),
      FullName: newFullName,
      Email: newEmail,
      Phone: newPhone || "09xxxxxxx",
      DepartmentID: newDept,
      RoleID: newRole,
      TotalScore: Number(newScore),
      CurrentLevel: getLevelName(newScore),
      Status: 'Active',
      CreatedDate: new Date().toISOString().split('T')[0],
      Avatar: mockAvatar
    };

    onUpdateDatabase({ users: [...allUsers, newMember] });
    
    // Reset Form
    setNewFullName('');
    setNewStudentCode('');
    setNewEmail('');
    setNewPhone('');
    setNewScore(100);
    setShowAddModal(false);
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    const updated = allUsers.map(u => {
      if (u.UserID === showEditModal.UserID) {
        return {
          ...u,
          FullName: editFullName,
          StudentCode: editStudentCode.toUpperCase(),
          Email: editEmail,
          Phone: editPhone,
          DepartmentID: editDept,
          RoleID: editRole,
          TotalScore: Number(editScore),
          CurrentLevel: getLevelName(editScore),
          Status: editStatus
        };
      }
      return u;
    });

    onUpdateDatabase({ users: updated });
    setShowEditModal(null);
  };

  const handleDeleteMember = (userId: number) => {
    const user = allUsers.find(u => u.UserID === userId);
    if (!user) return;
    
    if (confirm(`Bạn có chắc chắn muốn rời và loại thành viên ${user.FullName} khỏi CLB?`)) {
      onUpdateDatabase({ users: allUsers.filter(u => u.UserID !== userId) });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 select-none font-sans">
      
      {/* Search and Title Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
              <Users size={16} className="text-slate-700" /> Bảng vàng & Thành viên
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Danh sách xếp hạng và hồ sơ quản lý thành viên CLB.</p>
          </div>

          {/* ADMIN ACTION: Add Member */}
          {currentUser.RoleID >= RoleID.ADMIN && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 text-white font-bold py-1.5 px-3.5 rounded text-[10px] uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-1 shadow-none"
              id="add-member-button"
            >
              <UserPlus size={12} /> Thêm Mới
            </button>
          )}
        </div>

        {/* Inputs and Search Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên hoặc Mã MSSV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded py-2 pl-9 pr-4 text-xs font-semibold w-full outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-slate-400 shrink-0" />
            <select
              value={selectedDept === null ? '' : selectedDept}
              onChange={(e) => setSelectedDept(e.target.value === '' ? null : Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:border-slate-400"
            >
              <option value="">Tất cả Ban</option>
              {DEPARTMENTS.map(d => (
                <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName.split(' ').pop()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. LEADERBOARD REVERSED / BRONZE, SILVER, GOLD PODIUM (Bản xếp hạng TOP 3 đóng góp) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 mb-5 border border-slate-800">
        <h3 className="font-display font-extrabold text-[10px] text-amber-400 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          🏆 TOP 3 CỐNG HIẾN CAO NHẤT THÁNG
        </h3>

        <div className="flex items-end justify-center gap-5 pt-3 pb-2 select-none">
          
          {/* Rank 2 (Silver) */}
          {sortedLeaderboard[1] && (
            <div 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onViewUserProfile(sortedLeaderboard[1].UserID)}
            >
              <div className="relative">
                <img 
                  src={sortedLeaderboard[1].Avatar} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-neutral-300 shadow-md group-hover:scale-105 transition"
                  alt="" 
                />
                <span className="absolute -bottom-1 -right-1 bg-neutral-300 text-neutral-900 font-mono font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-1 border-white">
                  2
                </span>
              </div>
              <span className="text-xs font-bold mt-2 truncate max-w-[80px]">{sortedLeaderboard[1].FullName.split(' ').pop()}</span>
              <span className="text-[10px] font-mono text-neutral-300">{sortedLeaderboard[1].TotalScore}đ</span>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {sortedLeaderboard[0] && (
            <div 
              className="flex flex-col items-center cursor-pointer group -mt-4"
              onClick={() => onViewUserProfile(sortedLeaderboard[0].UserID)}
            >
              <div className="relative">
                <div className="absolute -top-3 left-1/3 text-yellow-400 animate-bounce">👑</div>
                <img 
                  src={sortedLeaderboard[0].Avatar} 
                  className="w-18 h-18 rounded-full object-cover border-4 border-yellow-400 shadow-lg group-hover:scale-105 transition"
                  alt="" 
                />
                <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-neutral-900 font-mono font-extrabold text-xs w-6 h-6 flex items-center justify-center rounded-full border-1 border-white">
                  1
                </span>
              </div>
              <span className="text-sm font-extrabold mt-2 text-yellow-300 truncate max-w-[100px]">{sortedLeaderboard[0].FullName.split(' ').pop()}</span>
              <span className="text-xs font-bold font-mono text-white">{sortedLeaderboard[0].TotalScore}đ</span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {sortedLeaderboard[2] && (
            <div 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onViewUserProfile(sortedLeaderboard[2].UserID)}
            >
              <div className="relative">
                <img 
                  src={sortedLeaderboard[2].Avatar} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-600 shadow-md group-hover:scale-105 transition"
                  alt="" 
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white font-mono font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-1 border-white">
                  3
                </span>
              </div>
              <span className="text-xs font-bold mt-2 truncate max-w-[80px]">{sortedLeaderboard[2].FullName.split(' ').pop()}</span>
              <span className="text-[10px] font-mono text-neutral-300">{sortedLeaderboard[2].TotalScore}đ</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. CORE PERSONAL MEMBERS DATA TABLE GRID */}
      <div id="members-list-container" className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
          <span className="text-xs font-extrabold text-neutral-800">
            Duyệt Nhân Sự CLB ({filteredUsers.length} kết quả)
          </span>
          <span className="text-[10px] bg-neutral-100 text-neutral-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
            Học kỳ Hè 2026
          </span>
        </div>

        <div className="flex flex-col divide-y divide-neutral-100 max-h-[360px] overflow-y-auto">
          {filteredUsers.map((user) => {
            const roleBadge = user.RoleID === RoleID.SUPER_ADMIN ? 'bg-rose-50 text-rose-600 border-rose-100' :
                             user.RoleID === RoleID.ADMIN ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-neutral-50 text-neutral-600 border-neutral-100';

            return (
              <div 
                key={user.UserID} 
                className="flex items-center justify-between p-4 hover:bg-neutral-50 transition"
              >
                {/* Left Profile Info */}
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1 mr-2 overflow-hidden"
                  onClick={() => onViewUserProfile(user.UserID)}
                >
                  <img 
                    src={user.Avatar} 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-100 shrink-0" 
                    alt={user.FullName} 
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs text-neutral-950 truncate flex items-center gap-1.5">
                      {user.FullName}
                      {user.Status === 'Inactive' && (
                        <span className="bg-neutral-200 text-neutral-600 text-[9px] px-1.5 py-0.2 rounded font-sans">
                          Tạm nghỉ
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5 truncate">
                      <span>{user.StudentCode}</span>
                      <span>•</span>
                      <span>{getDeptName(user.DepartmentID).split(' ').pop()}</span>
                    </p>
                  </div>
                </div>

                {/* Right Metadata score & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-neutral-900 block font-mono">
                      {user.TotalScore}đ
                    </span>
                    <span className="text-[10px] font-bold text-indigo-500 italic">
                      Lớp: {user.CurrentLevel}
                    </span>
                  </div>

                  {/* ADMIN EDIT ACTIONS */}
                  {currentUser.RoleID >= RoleID.ADMIN && (
                    <div className="flex items-center gap-1">
                      <button
                        title="Chỉnh sửa thông tin"
                        onClick={() => handleOpenEditModal(user)}
                        className="p-1 px-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition"
                      >
                        <Edit size={12} />
                      </button>
                      
                      {currentUser.RoleID === RoleID.SUPER_ADMIN && user.UserID !== currentUser.UserID && (
                        <button
                          title="Loại bỏ thành viên"
                          onClick={() => handleDeleteMember(user.UserID)}
                          className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center py-10">
              <Users className="mx-auto text-neutral-300 mb-2" size={32} />
              <p className="text-xs text-neutral-500 font-semibold">Không tìm thấy thành viên nào thỏa mãn từ khóa.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. DIALOG MODAL: ADD CLUB MEMBER */}
      {showAddModal && (
        <div id="add-member-modal" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleAddNewMember}
            className="bg-white rounded-2xl p-5 max-w-md w-full border border-neutral-200 animate-slide-up flex flex-col gap-4 shadow-xl"
          >
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-sans font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <UserPlus size={16} /> Thêm Thành Viên CLB Mới
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Mã Số Sinh Viên (MSSV)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: HE180123"
                    value={newStudentCode}
                    onChange={(e) => setNewStudentCode(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Hệ Số Điểm Ban Đầu</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="100"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Email Học Tập</label>
                <input 
                  type="email" 
                  required
                  placeholder="Ví dụ: anhnv@fpt.edu.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Số điện thoại liên hệ</label>
                <input 
                  type="text"
                  placeholder="Ví dụ: 0912345678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Ban Giao Trực Thuộc</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(Number(e.target.value))}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Phân Quyền Hệ Thống</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(Number(e.target.value))}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none cursor-pointer"
                  >
                    <option value={RoleID.MEMBER}>Thành viên thường</option>
                    <option value={RoleID.ADMIN}>Trưởng / Phó ban</option>
                    {currentUser.RoleID === RoleID.SUPER_ADMIN && (
                      <option value={RoleID.SUPER_ADMIN}>Super Admin - Ban chủ nhiệm</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-xl text-xs font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 bg-neutral-900 hover:bg-neutral-950 text-white py-2 rounded-xl text-xs font-semibold transition"
              >
                Đăng ký Thành Viên
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. DIALOG MODAL: EDIT/UPDATE MEMBER */}
      {showEditModal && (
        <div id="edit-member-modal" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleUpdateMember}
            className="bg-white rounded-2xl p-5 max-w-md w-full border border-neutral-200 animate-slide-up flex flex-col gap-4 shadow-xl"
          >
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-sans font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <Edit size={16} /> Chỉnh sửa Hồ Sơ Thành Viên
              </h3>
              <button 
                type="button" 
                onClick={() => setShowEditModal(null)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Mã Số định danh & Họ và Tên</label>
                <input 
                  type="text" 
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Mã Sinh viên (MSSV)</label>
                  <input 
                    type="text" 
                    required
                    value={editStudentCode}
                    onChange={(e) => setEditStudentCode(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Total Score (Điểm CLB)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editScore}
                    onChange={(e) => setEditScore(Number(e.target.value))}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Email học tập</label>
                <input 
                  type="email" 
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Ban trực thuộc</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(Number(e.target.value))}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Vai trò CLB</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(Number(e.target.value))}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none cursor-pointer"
                  >
                    <option value={RoleID.MEMBER}>Thành viên thường</option>
                    <option value={RoleID.ADMIN}>Trưởng / Phó ban</option>
                    {currentUser.RoleID === RoleID.SUPER_ADMIN && (
                      <option value={RoleID.SUPER_ADMIN}>Super Admin - Ban chủ nhiệm</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Trạng thái Hoạt động</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs w-full outline-none cursor-pointer"
                >
                  <option value="Active">Đang hoạt động tích cực</option>
                  <option value="Inactive">Xin nghỉ tạm thời (Tự do/Bảo lưu)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 mt-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-xl text-xs font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 bg-neutral-900 hover:bg-neutral-950 text-white py-2 rounded-xl text-xs font-semibold transition"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
