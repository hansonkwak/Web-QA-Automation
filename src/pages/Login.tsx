import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email: user.email, name: user.name }));
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div data-testid="login-page" className="flex justify-center items-center py-20 px-4">
      <div className="bg-surface border border-surface-variant rounded-2xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[48px] text-primary mb-2">lock</span>
          <h2 className="font-headline-lg text-headline-lg text-primary">Login to QA Shop</h2>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded mb-6 font-body-sm text-body-sm text-center" data-testid="login-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} data-testid="login-form" className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              data-testid="login-email" 
              placeholder="test@example.com"
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              data-testid="login-password" 
              placeholder="password123"
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none"
            />
          </div>
          
          <button type="submit" className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 rounded transition-colors mt-2" data-testid="login-submit">
            Login
          </button>
        </form>
        
        <div className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
          Don't have an account? <Link to="/register" className="text-secondary hover:underline font-medium">Register here</Link>
        </div>
      </div>
    </div>
  );
};
