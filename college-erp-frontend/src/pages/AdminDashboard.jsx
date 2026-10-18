import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ShieldCheck, UserPlus, LogOut, RefreshCw, Megaphone, CreditCard, DollarSign, Search, Edit3, Save } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'teachers'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fee Manager State
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFee, setEditFee] = useState({ totalFees: '', paidFees: '' });

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    department: 'CS',
    semester: '1'
  });

  // Course Fee Setup State
  const [courseData, setCourseData] = useState({ courseName: '', department: 'CS', annualFee: '' });

  // Fee Collection State
  const [feeData, setFeeData] = useState({ rollNo: '', amountPaid: '', paymentMode: 'Online' });

  // Notice Broadcast State
  const [noticeData, setNoticeData] = useState({ title: '', content: '', category: 'general' });

  const navigate = useNavigate();

  // Fetch Users from Backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Add New User
  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await axios.post('http://localhost:5001/api/auth/register', newUser);
      setMessage({ type: 'success', text: `${newUser.role.toUpperCase()} successfully created!` });
      
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: activeTab === 'teachers' ? 'teacher' : 'student',
        rollNumber: '',
        department: 'CS',
        semester: '1'
      });
      
      fetchUsers();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create user. Ensure email/roll is unique.'
      });
    }
  };

  // Set / Update Course Fee
  const handleSetCourseFee = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5001/api/auth/set-course-fee', courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: res.data.message || 'Course fee structure saved successfully!' });
      setCourseData({ courseName: '', department: 'CS', annualFee: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error setting course fee.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Collect Fee & Send Email Receipt
  const handleCollectFee = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/fee/pay', feeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Fee collected & email receipt sent successfully!' });
      setFeeData({ rollNo: '', amountPaid: '', paymentMode: 'Online' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error processing fee payment.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Broadcast Notice
  const handleAddNotice = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/auth/add-notice', noticeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Notice published and broadcasted successfully!' });
      setNoticeData({ title: '', content: '', category: 'general' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error publishing notice.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Fee Manager Edit Actions
  const handleEditClick = (student) => {
    setEditingId(student._id);
    setEditFee({
      totalFees: student.totalFees || 120000,
      paidFees: student.paidFees || 0
    });
  };

  const handleSaveFee = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5001/api/auth/update-fee',
        { studentId, ...editFee },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Student fee updated successfully!' });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update student fee details.' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredUsers = users.filter(user => user.role === (activeTab === 'teachers' ? 'teacher' : 'student'));

  const studentFeeList = users
    .filter(u => u.role === 'student')
    .filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 shrink-0" />
            College ERP Admin Console
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage Students, Faculty, Fee Structure & Announcements</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm mb-6 border font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
            : 'bg-red-500/20 border-red-500/50 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Total Registered Students</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {users.filter(u => u.role === 'student').length}
            </h3>
          </div>
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Total Faculty / Teachers</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {users.filter(u => u.role === 'teacher').length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between sm:col-span-2 md:col-span-1">
          <div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Backend Status</p>
            <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">Online (Port 5001)</h3>
          </div>
          <button 
            onClick={fetchUsers} 
            className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Department-wise Student Distribution</h2>
          <div className="h-56 sm:h-64 flex items-center justify-center">
            <Bar
              data={{
                labels: ['CS', 'ECE', 'ME', 'Civil'],
                datasets: [
                  {
                    label: 'Registered Students',
                    data: [
                      users.filter(u => u.role === 'student' && (u.department === 'CS' || u.department === 'Computer Science')).length,
                      users.filter(u => u.role === 'student' && u.department === 'ECE').length,
                      users.filter(u => u.role === 'student' && u.department === 'ME').length,
                      users.filter(u => u.role === 'student' && u.department === 'Civil').length,
                    ],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl flex flex-col items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 w-full text-left">Campus User Demographics</h2>
          <div className="h-56 sm:h-64 w-full flex items-center justify-center">
            <Pie
              data={{
                labels: ['Students', 'Teachers', 'Admins'],
                datasets: [
                  {
                    data: [
                      users.filter(u => u.role === 'student').length,
                      users.filter(u => u.role === 'teacher').length,
                      users.filter(u => u.role === 'admin').length,
                    ],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8' } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Section 1: User Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl h-fit">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Add New User
          </h2>

          <form onSubmit={handleAddUser} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">User Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Rishav Chaturvedi"
                value={newUser.name}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. user@its.edu.in"
                value={newUser.email}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={newUser.password}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {newUser.role === 'student' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  placeholder="e.g. CS202601"
                  value={newUser.rollNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all text-xs sm:text-sm mt-2"
            >
              Register {newUser.role.toUpperCase()}
            </button>
          </form>
        </div>

        {/* User List Table */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl">
          <div className="flex border-b border-slate-700 mb-4 sm:mb-6 gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('students');
                setNewUser(prev => ({ ...prev, role: 'student' }));
              }}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Students List
            </button>
            <button
              onClick={() => {
                setActiveTab('teachers');
                setNewUser(prev => ({ ...prev, role: 'teacher' }));
              }}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'teachers'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Faculty / Teachers List
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300 min-w-[500px]">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] sm:text-xs">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, idx) => (
                    <tr key={u._id || idx} className="hover:bg-slate-800/80 transition-colors">
                      <td className="p-3 font-medium text-white">{u.name}</td>
                      <td className="p-3 text-slate-400">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                          u.role === 'teacher' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold">Active</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500">
                      No {activeTab} accounts found or loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: ERP Controls Grid (Fee Setup & Fee Collection) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            Set Course Fee Structure
          </h2>
          <form onSubmit={handleSetCourseFee} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Course Name</label>
              <input
                type="text"
                placeholder="e.g. B.Tech CSE"
                value={courseData.courseName}
                onChange={(e) => setCourseData({ ...courseData, courseName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={courseData.department}
                onChange={(e) => setCourseData({ ...courseData, department: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Annual Fee (₹)</label>
              <input
                type="number"
                placeholder="e.g. 120000"
                value={courseData.annualFee}
                onChange={(e) => setCourseData({ ...courseData, annualFee: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all text-xs sm:text-sm mt-2"
            >
              Save Course Fee Structure
            </button>
          </form>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Collect Student Fee & Issue Receipt
          </h2>
          <form onSubmit={handleCollectFee} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Student Roll Number</label>
              <input
                type="text"
                placeholder="e.g. CS202601"
                value={feeData.rollNo}
                onChange={(e) => setFeeData({ ...feeData, rollNo: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={feeData.amountPaid}
                onChange={(e) => setFeeData({ ...feeData, amountPaid: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Payment Mode</label>
              <select
                value={feeData.paymentMode}
                onChange={(e) => setFeeData({ ...feeData, paymentMode: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all text-xs sm:text-sm mt-2"
            >
              Collect Fee & Send Mail Receipt
            </button>
          </form>
        </div>
      </div>

      {/* Section 3: Broadcast Notice System */}
      <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-purple-400" />
          Broadcast Campus Notice
        </h2>
        <form onSubmit={handleAddNotice} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notice Title</label>
              <input
                type="text"
                placeholder="e.g. Mid-Term Examination Schedule"
                value={noticeData.title}
                onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select
                value={noticeData.category}
                onChange={(e) => setNoticeData({ ...noticeData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notice Content / Description</label>
            <textarea
              placeholder="Write detailed notice announcement here..."
              value={noticeData.content}
              onChange={(e) => setNoticeData({ ...noticeData, content: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 h-24"
              required
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all text-xs sm:text-sm"
          >
            Publish & Broadcast Notice
          </button>
        </form>
      </div>

      {/* Section 4: Student Dues & Fee Ledger Management Table */}
      <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              Student Dues & Fee Ledger Management
            </h2>
            <p className="text-xs text-slate-400 mt-1">Assign dues and record student payments in real-time</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-900/60">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300 min-w-[650px]">
            <thead className="bg-slate-900 text-[10px] sm:text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3 sm:p-4">Roll No</th>
                <th className="p-3 sm:p-4">Student Name</th>
                <th className="p-3 sm:p-4">Dept / Sem</th>
                <th className="p-3 sm:p-4">Total Fee (₹)</th>
                <th className="p-3 sm:p-4">Paid Fee (₹)</th>
                <th className="p-3 sm:p-4">Remaining Balance</th>
                <th className="p-3 sm:p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {studentFeeList.length > 0 ? (
                studentFeeList.map((student) => {
                  const isEditing = editingId === student._id;
                  const total = isEditing ? editFee.totalFees : (student.totalFees || 120000);
                  const paid = isEditing ? editFee.paidFees : (student.paidFees || 0);
                  const due = total - paid;

                  return (
                    <tr key={student._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 sm:p-4 font-semibold text-white">{student.rollNumber || 'N/A'}</td>
                      <td className="p-3 sm:p-4 font-medium text-white">{student.name}</td>
                      <td className="p-3 sm:p-4 text-[10px] sm:text-xs">{student.department || 'CS'} - Sem {student.semester || '1'}</td>
                      
                      <td className="p-3 sm:p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFee.totalFees}
                            onChange={(e) => setEditFee({ ...editFee, totalFees: e.target.value })}
                            className="w-20 sm:w-24 bg-slate-800 border border-slate-600 rounded p-1 text-xs text-white"
                          />
                        ) : (
                          `₹ ${Number(total).toLocaleString('en-IN')}`
                        )}
                      </td>

                      <td className="p-3 sm:p-4 text-emerald-400 font-semibold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFee.paidFees}
                            onChange={(e) => setEditFee({ ...editFee, paidFees: e.target.value })}
                            className="w-20 sm:w-24 bg-slate-800 border border-slate-600 rounded p-1 text-xs text-white"
                          />
                        ) : (
                          `₹ ${Number(paid).toLocaleString('en-IN')}`
                        )}
                      </td>

                      <td className={`p-3 sm:p-4 font-semibold ${due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ₹ {Number(due).toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 sm:p-4 text-center">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveFee(student._id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(student)}
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Dues
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    No student fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;