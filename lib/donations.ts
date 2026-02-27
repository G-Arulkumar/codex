import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { AIInsights, Donation } from '@/types/donation';

const donationCollection = collection(db, 'donations');

export function subscribeDonations(cb: (donations: Donation[]) => void) {
  return onSnapshot(query(donationCollection, orderBy('createdAt', 'desc')), (snapshot) => {
    const docs = snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? undefined
      };
    }) as Donation[];
    cb(docs);
  });
}

export async function uploadDonationImage(file: File, uid: string) {
  const imageRef = ref(storage, `donations/${uid}/${Date.now()}-${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export async function createDonation(payload: Omit<Donation, 'id' | 'status' | 'createdAt'> & { ai: AIInsights }) {
  await addDoc(donationCollection, {
    ...payload,
    status: 'available',
    createdAt: serverTimestamp()
  });
}

export async function updateDonationStatus(id: string, status: Donation['status'], acceptedBy?: string) {
  await updateDoc(doc(db, 'donations', id), {
    status,
    ...(acceptedBy ? { acceptedBy } : {})
  });
}
