import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { getCurrentMonth } from '../utils/calculator';

const ExpenseContext = createContext();

const DEFAULT_MEMBERS = ['Người 1', 'Người 2', 'Người 3', 'Người 4'];

export function ExpenseProvider({ children }) {
  const { user } = useAuth();
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [entries, setEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);

  // Reset state when user logs out
  const resetState = () => {
    setMembers(DEFAULT_MEMBERS);
    setEntries([]);
    setLoading(false);
  };

  // Subscribe to members config from Firestore
  useEffect(() => {
    if (!user) {
      resetState();
      return;
    }

    setLoading(true);
    const configRef = doc(db, 'users', user.uid, 'config', 'settings');

    const unsubConfig = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        setMembers(snap.data().members || DEFAULT_MEMBERS);
      } else {
        // First time: create default config
        setDoc(configRef, { members: DEFAULT_MEMBERS });
        setMembers(DEFAULT_MEMBERS);
      }
    });

    return unsubConfig;
  }, [user]);

  // Subscribe to entries from Firestore
  useEffect(() => {
    if (!user) return;

    const entriesRef = collection(db, 'users', user.uid, 'entries');
    const q = query(entriesRef, orderBy('date', 'desc'));

    const unsubEntries = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(entriesData);
      setLoading(false);
    });

    return unsubEntries;
  }, [user]);

  // Save members to Firestore
  const saveMembersToFirestore = useCallback(
    async (newMembers) => {
      if (!user) return;
      const configRef = doc(db, 'users', user.uid, 'config', 'settings');
      await setDoc(configRef, { members: newMembers }, { merge: true });
    },
    [user]
  );

  const addEntry = useCallback(
    async (entry) => {
      if (!user) return null;
      const entriesRef = collection(db, 'users', user.uid, 'entries');
      const docRef = await addDoc(entriesRef, entry);
      return { id: docRef.id, ...entry };
    },
    [user]
  );

  const updateEntry = useCallback(
    async (id, updatedEntry) => {
      if (!user) return;
      const entryRef = doc(db, 'users', user.uid, 'entries', id);
      await updateDoc(entryRef, updatedEntry);
    },
    [user]
  );

  const deleteEntry = useCallback(
    async (id) => {
      if (!user) return;
      const entryRef = doc(db, 'users', user.uid, 'entries', id);
      await deleteDoc(entryRef);
    },
    [user]
  );

  const getEntriesForMonth = useCallback(
    (month) => {
      return entries.filter((e) => e.date.startsWith(month));
    },
    [entries]
  );

  const updateMember = useCallback(
    async (index, newName) => {
      const updated = [...members];
      updated[index] = newName;
      setMembers(updated);
      await saveMembersToFirestore(updated);
    },
    [members, saveMembersToFirestore]
  );

  const addMember = useCallback(
    async (name) => {
      const updated = [...members, name];
      setMembers(updated);
      await saveMembersToFirestore(updated);
    },
    [members, saveMembersToFirestore]
  );

  const removeMember = useCallback(
    async (index) => {
      // Check if member has entries
      const hasEntries = entries.some(
        (e) => e.buyerIndex === index || e.participants.includes(index)
      );
      if (hasEntries) {
        return false;
      }
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
      await saveMembersToFirestore(updated);
      return true;
    },
    [entries, members, saveMembersToFirestore]
  );

  const value = {
    members,
    entries,
    selectedMonth,
    setSelectedMonth,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForMonth,
    updateMember,
    addMember,
    removeMember,
    loading,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}
