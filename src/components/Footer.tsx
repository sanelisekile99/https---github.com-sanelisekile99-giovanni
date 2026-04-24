import { useState } from 'react';
import { Link } from 'react-router-dom';

const PROJECT_ID = window.location.hostname.includes('famous.ai')
  ? window.location.pathname.split('/')[1]
  : '';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch(`https://famous.ai/api/crm/${PROJECT_ID}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'footer-signup',
          tags: ['newsletter', 'footer-signup'],
        }),
      });
    } catch {
      // silently handle
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Newsletter section */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="max-w-lg mx-auto text-center">
            <h3 className="font-heading text-2xl lg:text-3xl tracking-[0.1em] font-light mb-3">
              Join the World of Giovanni
            </h3>
            <p className="text-[13px] text-white/50 font-light tracking-wide mb-8">
              Be the first to discover new collections, exclusive pieces, and private events.
            </p>
            {subscribed ? (
              <p className="text-[12px] tracking-[0.2em] uppercase text-[#D4E5E1]">
                Welcome to Giovanni
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-transparent border border-white/20 border-r-0 px-4 py-3 text-sm font-light placeholder:text-white/30 outline-none focus:border-white/40 transition-colors tracking-wide"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-[#1A1A1A] text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#D4E5E1] transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase mb-6 font-medium">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/collections/new-arrivals"
                  className="text-[13px] text-white/50 hover:text-white transition-colors font-light"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/t-shirts"
                  className="text-[13px] text-white/50 hover:text-white transition-colors font-light"
                >
                  T-Shirts
                </Link>
                <ul className="mt-2 ml-3 space-y-2 border-l border-white/10 pl-3">
                  <li>
                    <Link
                      to="/shop?q=black%20t-shirt"
                      className="text-[12px] text-white/40 hover:text-white transition-colors font-light"
                    >
                      Black t-shirt
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop?q=chocolate%20brown%20t-shirt"
                      className="text-[12px] text-white/40 hover:text-white transition-colors font-light"
                    >
                      Chocolate brown t-shirt
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop?q=ecru%20t-shirt"
                      className="text-[12px] text-white/40 hover:text-white transition-colors font-light"
                    >
                      Ecru t-shirt
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  to="/collections/sweaters"
                  className="text-[13px] text-white/50 hover:text-white transition-colors font-light"
                >
                  Sweaters
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/two-piece-sets"
                  className="text-[13px] text-white/50 hover:text-white transition-colors font-light"
                >
                  Linen
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/limited-edition"
                  className="text-[13px] text-white/50 hover:text-white transition-colors font-light"
                >
                  Limited Edition
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase mb-6 font-medium">About</h4>
            <ul className="space-y-3">
              {['Our Story', 'Craftsmanship', 'Sustainability', 'Press'].map(item => (
                <li key={item}>
                  <span className="text-[13px] text-white/50 hover:text-white transition-colors font-light cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase mb-6 font-medium">Help</h4>
            <ul className="space-y-3">
              {['Shipping & Returns', 'Size Guide', 'Care Instructions', 'Contact Us'].map(item => (
                <li key={item}>
                  <span className="text-[13px] text-white/50 hover:text-white transition-colors font-light cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase mb-6 font-medium">Connect</h4>
            <ul className="space-y-3">
              {['Instagram', 'Pinterest', 'Twitter'].map(item => (
                <li key={item}>
                  <span className="text-[13px] text-white/50 hover:text-white transition-colors font-light cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30 font-light tracking-wide">
            &copy; {new Date().getFullYear()} Giovanni. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service'].map(item => (
              <span key={item} className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-light cursor-pointer">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
