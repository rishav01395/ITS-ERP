import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Attempting login with:", formData.email, formData.role);
      const response = await axios.post('http://localhost:5001/api/auth/login', formData);
      const { token, user } = response.data;
      
      // Save Token and User Data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Line 30-36 ko is tarah verify/update kar lo:
const userRole = user?.role || formData.role;

if (userRole === 'student') {
  navigate('/student-dashboard');
} else if (userRole === 'teacher') {
  navigate('/teacher-dashboard');
} else if (userRole === 'admin') {
  navigate('/admin-dashboard');
}

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/30 rounded-xl mb-3 text-blue-400">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wide">ITS ERP</h2>
          <p className="text-slate-300 text-sm mt-1">ITS Engineering College · Sign in to your portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['student', 'teacher', 'admin'].map((roleType) => (
                <button
                  key={roleType}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: roleType })}
                  className={`py-2 text-xs font-semibold rounded-lg capitalize transition-all duration-200 border ${
                    formData.role === roleType
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {roleType}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="user@its.edu.in"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          New to ITS ERP?{' '}
          <Link className="font-semibold text-blue-300 hover:text-white" to="/signup">
            Create a student account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;