import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, loginAdmin } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (await isAdminAuthenticated()) {
          console.log('User already authenticated as admin, redirecting to dashboard');
          navigate('/admin', { replace: true });
        }
      } catch (error) {
        console.error('Error checking admin authentication:', error);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    console.log('Submitting admin login form');

    try {
      const result = await loginAdmin(email, password);
      console.log('Login result:', result);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      console.log('Admin login successful, navigating to dashboard');
      // Use replace to prevent going back to login page
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Unexpected error during admin login:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-[#ECE8E3] p-7 lg:p-8">
        <div className="mb-6 text-center">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B8B8B] mb-2">Restricted Access</p>
          <h1 className="font-heading text-2xl tracking-[0.06em] text-[#1A1A1A] font-light">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Admin email"
            required
            className="w-full h-11 px-4 border border-[#E8E5E1] text-sm outline-none focus:border-[#1A1A1A]"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            required
            className="w-full h-11 px-4 border border-[#E8E5E1] text-sm outline-none focus:border-[#1A1A1A]"
          />

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full h-11 bg-[#1A1A1A] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#333] transition-colors"
          >
            Login to Dashboard
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-[11px] tracking-[0.18em] uppercase text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
