import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      setError('Email already exists');
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({ email, name }));
    navigate('/');
  };

  return (
    <div data-testid="register-page" className="flex justify-center items-center py-12 px-4">
      <div className="bg-surface border border-surface-variant rounded-2xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[48px] text-primary mb-2">person_add</span>
          <h2 className="font-headline-lg text-headline-lg text-primary">Create an Account</h2>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded mb-6 font-body-sm text-body-sm text-center" data-testid="register-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} data-testid="register-form" className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface">Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              data-testid="register-name" 
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              data-testid="register-email" 
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
              data-testid="register-password" 
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface">Confirm Password</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              data-testid="register-confirm" 
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none"
            />
          </div>
          
          <button type="submit" className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 rounded transition-colors mt-2" data-testid="register-submit">
            Register
          </button>
        </form>
        
        <div className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
          Already have an account? <Link to="/login" className="text-secondary hover:underline font-medium">Login here</Link>
        </div>
      </div>
    </div>
  );
};
