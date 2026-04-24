import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useClientAccount } from '@/contexts/ClientAccountContext';

export default function AccountAuthPage() {
  const navigate = useNavigate();
  const { loginClient, registerClient } = useClientAccount();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    birthdayMonth: '',
    birthdayDay: '',
  });

  const inputClass =
    'w-full h-12 px-4 py-3 border border-[#E8E5E1] text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white box-border';

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const result = await loginClient(signInData);
    if (!result.ok) {
      setError('message' in result ? result.message : 'Unable to sign in right now.');
      return;
    }
    navigate('/account');
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const result = await registerClient({
      ...signUpData,
      birthdayMonth: Number(signUpData.birthdayMonth),
      birthdayDay: Number(signUpData.birthdayDay),
    });
    if (!result.ok) {
      setError('message' in result ? result.message : 'Unable to create account right now.');
      return;
    }
    navigate('/account');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      <div className="bg-[#FAFAF8] py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">Client Area</p>
          <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-6 py-10 lg:py-14">
        <div className="flex items-center gap-2 mb-8 border-b border-[#F0EDE9]">
          <button
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`pb-3 text-[11px] tracking-[0.2em] uppercase ${
              mode === 'signin' ? 'text-[#1A1A1A] border-b border-[#1A1A1A]' : 'text-[#A0A0A0]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`pb-3 text-[11px] tracking-[0.2em] uppercase ${
              mode === 'signup' ? 'text-[#1A1A1A] border-b border-[#1A1A1A]' : 'text-[#A0A0A0]'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={signInData.email}
              onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={signInData.password}
              onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
              className={inputClass}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={signUpData.name}
              onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={signUpData.email}
              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={signUpData.password}
              onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
              className={inputClass}
              minLength={8}
            />
            <ul className="text-[11px] text-[#8B8B8B] font-light space-y-1 pl-4 list-disc">
              <li>A minimum of 8 characters</li>
              <li>At least 1 uppercase character</li>
              <li>At least 1 lowercase character</li>
              <li>At least 1 number</li>
              <li>At least 1 special character (!, #, @, $, %, ^, etc.)</li>
            </ul>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={1}
                max={12}
                placeholder="Birth Month (1-12)"
                value={signUpData.birthdayMonth}
                onChange={(e) => setSignUpData({ ...signUpData, birthdayMonth: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                min={1}
                max={31}
                placeholder="Birth Day (1-31)"
                value={signUpData.birthdayDay}
                onChange={(e) => setSignUpData({ ...signUpData, birthdayDay: e.target.value })}
                className={inputClass}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
            >
              Create Account
            </button>
          </form>
        )}

        <p className="text-xs text-[#8B8B8B] mt-6 font-light">
          Uses Firebase Auth when configured. Otherwise falls back to local demo auth.
        </p>

        <div className="mt-8">
          <Link
            to="/shop"
            className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
          >
            Continue as Guest
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
