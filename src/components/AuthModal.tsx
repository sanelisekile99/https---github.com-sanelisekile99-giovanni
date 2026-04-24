import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useClientAccount } from '@/contexts/ClientAccountContext';

type AuthMode = 'signin' | 'signup';

type AuthModalProps = {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
};

export default function AuthModal({ open, initialMode = 'signin', onClose }: AuthModalProps) {
  const { loginClient, registerClient } = useClientAccount();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    birthdayMonth: '',
    birthdayDay: '',
  });

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError('');
      setLoading(false);
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const inputClass =
    'w-full h-12 px-4 py-3 border border-[#E8E5E1] text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white box-border';

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginClient(signInData);
    setLoading(false);

    if (!result.ok) {
      setError('message' in result ? result.message : 'Unable to sign in right now.');
      return;
    }

    onClose();
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await registerClient({
      ...signUpData,
      birthdayMonth: Number(signUpData.birthdayMonth),
      birthdayDay: Number(signUpData.birthdayDay),
    });
    setLoading(false);

    if (!result.ok) {
      setError('message' in result ? result.message : 'Unable to create account right now.');
      return;
    }

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-[520px] bg-white shadow-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EDE9]">
            <h2 className="font-heading text-2xl tracking-[0.05em] font-light text-[#1A1A1A]">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <button onClick={onClose} aria-label="Close auth modal" className="p-1 hover:opacity-60 transition-opacity">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-center gap-2 mb-6 border-b border-[#F0EDE9]">
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
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className={inputClass}
                  required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors disabled:opacity-60"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
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
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className={inputClass}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className={inputClass}
                  minLength={8}
                  required
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
                    required
                  />
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Birth Day (1-31)"
                    value={signUpData.birthdayDay}
                    onChange={(e) => setSignUpData({ ...signUpData, birthdayDay: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
