import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, LogOut, Download, CreditCard, IdCard, 
  CheckCircle, Clock, Bell, User, BookOpen, ShieldCheck, FileText 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'idcard', 'fees'

  const idCardRef = useRef(null);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Profile Data
      const profileRes = await axios.get('http://localhost:5001/api/auth/me', { headers });
      setStudent(profileRes.data);

      // 2. Announcements
      const noticeRes = await axios.get('http://localhost:5001/api/auth/notices', { headers });
      setNotices(noticeRes.data || []);
    } catch (err) {
      console.error("Error fetching student profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Download ID Card as Image/PDF
  const downloadIDCard = async () => {
    if (!idCardRef.current) return;
    const canvas = await html2canvas(idCardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('portrait', 'mm', 'a6');
    pdf.addImage(imgData, 'PNG', 10, 10, 85, 125);
    pdf.save(`${student?.name || 'Student'}_ID_Card.pdf`);
  };

  const total = student?.totalFees || 120000;
  const paid = student?.paidFees || 0;
  const due = total - paid;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-3 sm:p-6">
      {/* Responsive Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 shrink-0" />
            ITS ERP Student Portal
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Welcome back, <span className="text-white font-semibold">{student?.name || 'Student'}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-lg"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Navigation Tabs (Mobile Horizontally Scrollable) */}
      <div className="flex border-b border-slate-700 mb-6 gap-2 sm:gap-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'fees'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Fee Ledger & Receipt
        </button>
        <button
          onClick={() => setActiveTab('idcard')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'idcard'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <IdCard className="w-4 h-4" /> Digital ID Card
        </button>
      </div>

      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Roll Number</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{student?.rollNumber || 'CS202601'}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <User className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Department / Sem</p>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {student?.department || 'CS'} - Sem {student?.semester || '1'}
                </h3>
              </div>
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between sm:col-span-2 md:col-span-1">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Fee Balance Due</p>
                <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹ {Number(due).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          {/* Campus Notices List */}
          <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400 shrink-0" /> Campus Announcements
            </h2>

            <div className="space-y-3">
              {notices.length > 0 ? (
                notices.map((n, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-white text-sm">{n.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 uppercase">
                        {n.category || 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{n.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs sm:text-sm text-center py-6">No new campus announcements.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fee Ledger */}
      {activeTab === 'fees' && (
        <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" /> My Fee Summary & Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Total Course Fee</p>
              <p className="text-lg font-bold text-white mt-1">₹ {Number(total).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Total Paid Amount</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">₹ {Number(paid).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Remaining Balance Due</p>
              <p className={`text-lg font-bold mt-1 ${due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                ₹ {Number(due).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Digital ID Card */}
      {activeTab === 'idcard' && (
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Printable Canvas Element */}
          <div
            ref={idCardRef}
            className="w-full max-w-xs bg-slate-900 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 right-0 h-16 bg-blue-600/30 -z-0"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-blue-400 mx-auto flex items-center justify-center mb-3 shadow-md">
                <User className="w-10 h-10 text-blue-400" />
              </div>

              <h3 className="text-lg font-bold text-white">{student?.name || 'Rishav Chaturvedi'}</h3>
              <p className="text-xs text-blue-400 font-semibold mb-4">ITS Engineering College</p>

              <div className="space-y-2 text-left bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
                <p><span className="text-slate-400">Roll No:</span> <span className="font-semibold text-white">{student?.rollNumber || 'CS202601'}</span></p>
                <p><span className="text-slate-400">Department:</span> <span className="font-semibold text-white">{student?.department || 'Computer Science'}</span></p>
                <p><span className="text-slate-400">Semester:</span> <span className="font-semibold text-white">{student?.semester || '1'}</span></p>
                <p><span className="text-slate-400">Email:</span> <span className="font-semibold text-white truncate block">{student?.email}</span></p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Student</span>
                <span>ITS ERP 2026</span>
              </div>
            </div>
          </div>

          <button
            onClick={downloadIDCard}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/30"
          >
            <Download className="w-4 h-4" /> Download ID Card PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;