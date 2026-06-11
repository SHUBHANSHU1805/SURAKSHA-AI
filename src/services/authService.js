import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const PROFILE_STORAGE_KEY = 'trinetra_ai_user_profiles';

const readLocalProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeLocalProfiles = (profiles) => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
};

const saveLocalProfile = (uid, profile) => {
  const profiles = readLocalProfiles();
  profiles[uid] = profile;
  writeLocalProfiles(profiles);
};

const getLocalProfile = (uid) => readLocalProfiles()[uid] || null;

const serializeUser = (user, profile = null) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || '',
  photoURL: user.photoURL || '',
  emailVerified: !!user.emailVerified,
  profile
});

// Register new user
export const registerUser = async (email, password, userData) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile
    await updateProfile(user, {
      displayName: userData.name
    });
    
    const profile = {
      uid: user.uid,
      email: email,
      name: userData.name,
      role: userData.role || 'officer',
      department: userData.department || '',
      badgeNumber: userData.badgeNumber || '',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Try to persist profile in Firestore, but keep the account usable if rules block writes.
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch (profileError) {
      console.warn('Firestone profile write failed, using local fallback:', profileError);
      saveLocalProfile(user.uid, profile);
    }

    return serializeUser(user, profile);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user profile
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      return { 
        ...user, 
        profile: userDoc.data() 
      };
    } else {
      const localProfile = getLocalProfile(user.uid);
      if (localProfile) {
        return serializeUser(user, localProfile);
      }

        return serializeUser(user, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          role: 'officer'
        });
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (user) => {
        unsubscribe();
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                resolve(serializeUser(user, userDoc.data()));
            } else {
                resolve(serializeUser(user));
            }
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      }, 
      reject
    );
  });
};

// Update user profile
export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};