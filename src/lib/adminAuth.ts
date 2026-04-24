import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Check if the current user is an admin by checking custom claims
const isUserAdmin = async (user: User): Promise<boolean> => {
  try {
    const tokenResult = await user.getIdTokenResult();
    const isAdmin = tokenResult.claims.admin === true;
    console.log('Admin check for user:', user.uid, 'Claims:', tokenResult.claims, 'Is admin:', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    // If there's an error getting the token, try with force refresh
    try {
      const tokenResult = await user.getIdTokenResult(true);
      const isAdmin = tokenResult.claims.admin === true;
      console.log('Admin check with refresh for user:', user.uid, 'Claims:', tokenResult.claims, 'Is admin:', isAdmin);
      return isAdmin;
    } catch (refreshError) {
      console.error('Error checking admin status even with refresh:', refreshError);
      return false;
    }
  }
};

export const isAdminAuthenticated = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const admin = await isUserAdmin(user);
          resolve(admin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
};

export const loginAdmin = async (email: string, password: string) => {
  try {
    console.log('Attempting admin login for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Login successful for user:', user.uid);
    const isAdmin = await isUserAdmin(user);
    console.log('Is admin result:', isAdmin);

    if (!isAdmin) {
      console.log('User is not admin, signing out');
      await signOut(auth);
      return { ok: false as const, message: 'Access denied. Not an admin user.' };
    }

    console.log('Admin login successful, redirecting to dashboard');
    return { ok: true as const };
  } catch (error: unknown) {
    console.error('Admin login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed.';
    return { ok: false as const, message };
  }
};

export const logoutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Admin logout error:', error);
  }
};
