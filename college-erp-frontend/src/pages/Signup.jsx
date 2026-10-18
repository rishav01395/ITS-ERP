import React, { useState } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Dices,
  Hash,
  Lock,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const initialFormData = {
  name: '',
  email: '',
  mobileNumber: '',
  rollNo: '',
  department: '',
  semester: '',
  password: '',
};

const Signup = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const generateTestRollNo = () => {
    const year = new Date().getFullYear();
    const suffix = Math.floor(100 + Math.random() * 900);
    setFormData((currentFormData) => ({
      ...currentFormData,
      rollNo: `ITS${year}${suffix}`,
    }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        ...formData,
        role: 'student',
      });
      setSuccess(response.data.message || 'Registration successful. You can now sign in.');
      setFormData(initialFormData);
    } catch (requestError) {
      const backendMessage = requestError.response?.data?.message;
      setError(
        backendMessage ||
          'Registration failed. Your details are still filled in so you can edit them and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="mb-7 text-center">
          <div className="mb-3 inline-flex rounded-xl bg-blue-600/30 p-3 text-blue-400">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-wide text-white">ITS ERP</h1>
          <p className="mt-1 text-sm text-slate-300">Student Registration · ITS Engineering College</p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="mb-5 rounded-lg border border-emerald-500/50 bg-emerald-500/20 p-3 text-center text-sm text-emerald-200">
            <p>{success}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-2 font-semibold underline underline-offset-4 hover:text-white"
            >
              Go to Login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-300">Full Name</span>
            <span className="relative block">
              <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete="name"
                className={inputClassName}
                maxLength={100}
                name="name"
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                value={formData.name}
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-300">Email</span>
            <span className="relative block">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete="email"
                className={inputClassName}
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                required
                type="email"
                value={formData.email}
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-300">Mobile Number</span>
            <span className="relative block">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete="tel"
                className={inputClassName}
                maxLength={20}
                name="mobileNumber"
                onChange={handleChange}
                pattern="[+]?[0-9() -]{7,20}"
                placeholder="+91 98765 43210"
                required
                title="Enter a valid mobile number"
                type="tel"
                value={formData.mobileNumber}
              />
            </span>
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase text-slate-300">Enrollment / Roll Number</span>
              <button
                className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                onClick={generateTestRollNo}
                type="button"
              >
                <Dices size={13} />
                Generate test number
              </button>
            </div>
            <span className="relative block">
              <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete="off"
                className={inputClassName}
                maxLength={40}
                name="rollNo"
                onChange={handleChange}
                placeholder={`e.g. ITS${new Date().getFullYear()}001`}
                required
                value={formData.rollNo}
              />
            </span>
            <span className="mt-1 block text-[11px] text-slate-400">
              You can edit this number if it is already registered.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-300">Branch</span>
            <span className="relative block">
              <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <select
                className={`${inputClassName} appearance-none`}
                name="department"
                onChange={handleChange}
                required
                value={formData.department}
              >
                <option className="bg-slate-900" disabled value="">Select your branch</option>
                {['CSE', 'CSE-AIML', 'ME', 'ECE'].map((branch) => (
                  <option className="bg-slate-900" key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-300">Semester</span>
            <span className="relative block">
              <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <select
                className={`${inputClassName} appearance-none`}
                name="semester"
                onChange={handleChange}
                required
                value={formData.semester}
              >
                <option className="bg-slate-900" disabled value="">Select semester</option>
                {Array.from({ length: 8 }, (_, index) => String(index + 1)).map((semester) => (
                  <option className="bg-slate-900" key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-300">Password</span>
            <span className="relative block">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete="new-password"
                className={inputClassName}
                minLength={6}
                name="password"
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                type="password"
                value={formData.password}
              />
            </span>
          </label>

          <button
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creating Account…' : 'Create Student Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Already registered?{' '}
          <Link className="inline-flex items-center gap-1 font-semibold text-blue-300 hover:text-white" to="/login">
            <ArrowLeft size={15} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
