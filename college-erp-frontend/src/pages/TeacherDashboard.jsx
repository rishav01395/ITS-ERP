import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, CheckCircle2, XCircle, LogOut, Search, 
  CheckSquare, XSquare, BookOpen, Layers, Send, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('Data Structures');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchStudents = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/auth/students', {
        params: { department, semester, section },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const list = res.data || [];
      setStudents(list);

      const initialMap = {};
      list.forEach(s => { initialMap[s._id] = 'Present'; });
      setAttendance(initialMap);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, semester, section]);

  const toggleStatus = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    const records = students.map(s => ({
      studentId: s._id,
      status: attendance[s._id] || 'Present'
    }));

    try {
      await axios.post(
        'http://localhost:5001/api/attendance/mark',
        { department, semester, section, subject, date, records },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: `Attendance for ${records.length} students recorded successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Object.values(attendance).filter(v => v === 'Present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 shrink-0" />
            Teacher Attendance Portal
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Welcome back, <span className="text-white font-medium">{user.name || 'Faculty Member'}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-lg"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Class Selector Panel */}
      <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-xl mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Select Class, Subject & Date
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="Computer Science">Computer Science (CS)</option>
              <option value="Information Tech">Information Tech (IT)</option>
              <option value="Electronics">Electronics (EC)</option>
              <option value="Mechanical">Mechanical (ME)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. Data Structures"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Total Roster Students</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{students.length}</h3>
          </div>
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Marked Present</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{presentCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Marked Absent</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">{absentCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>

      {/* Message Alert Banner */}
      {message.text && (
        <div className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm mb-6 border font-medium ${
          message.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            : 'bg-red-500/20 border-red-500/50 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Student Roster Card */}
      <div className="bg-slate-800/50 border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Class Roster Sheet ({department} - Sem {semester} Sec {section})
            </h2>
            <p className="text-xs text-slate-400 mt-1">Click student status button to toggle Present / Absent</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-48 lg:w-56">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => markAll('Present')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
              >
                <CheckSquare className="w-4 h-4" /> All Present
              </button>

              <button
                type="button"
                onClick={() => markAll('Absent')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
              >
                <XSquare className="w-4 h-4" /> All Absent
              </button>

              <button
                onClick={fetchStudents}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition shrink-0"
                title="Refresh Roster"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Student Table (Scrollable on Mobile) */}
        <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-900/60 mb-6">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300 min-w-[550px]">
            <thead className="bg-slate-900 text-[10px] sm:text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3 sm:p-4">#</th>
                <th className="p-3 sm:p-4">Roll Number</th>
                <th className="p-3 sm:p-4">Student Name</th>
                <th className="p-3 sm:p-4">Department</th>
                <th className="p-3 sm:p-4 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => {
                  const status = attendance[s._id] || 'Present';
                  const isPresent = status === 'Present';

                  return (
                    <tr key={s._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 sm:p-4 text-slate-500 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 sm:p-4 font-semibold text-white font-mono">{s.rollNumber || 'N/A'}</td>
                      <td className="p-3 sm:p-4 font-medium text-white">{s.name}</td>
                      <td className="p-3 sm:p-4 text-xs text-slate-400">{s.department || department} (Sem {s.semester || semester})</td>
                      <td className="p-3 sm:p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(s._id)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 mx-auto ${
                            isPresent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                          }`}
                        >
                          {isPresent ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          {status}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 sm:p-12 text-slate-500">
                    {loading ? 'Loading class roster...' : `No students found for ${department} - Semester ${semester} (Section ${section})`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmitAttendance}
            disabled={submitting || students.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Saving Records...' : 'Submit Class Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;