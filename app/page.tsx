'use client';

import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { donationSchema } from '@/lib/schemas';
import { createDonation, subscribeDonations, updateDonationStatus, uploadDonationImage } from '@/lib/donations';
import { Donation, UrgencyLevel } from '@/types/donation';

function urgencyClass(level: UrgencyLevel) {
  if (level === 'HIGH') return 'bg-red-500 text-white';
  if (level === 'MEDIUM') return 'bg-amber-400 text-black';
  return 'bg-emerald-500 text-white';
}

function Dashboard() {
  const { theme, setTheme } = useTheme();
  const { user, role, setRole, login, logout, loading } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => subscribeDonations(setDonations), []);

  const impact = useMemo(() => {
    const meals = donations.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const today = new Date().toDateString();
    const todayCount = donations.filter((d) => d.createdAt && new Date(d.createdAt).toDateString() === today).length;
    return {
      meals,
      todayCount,
      co2: (meals * 1.8).toFixed(1)
    };
  }, [donations]);

  const onCreateDonation = async (formData: FormData) => {
    if (!user) return;
    try {
      setSubmitting(true);
      const parsed = donationSchema.parse({
        title: formData.get('title'),
        quantity: formData.get('quantity'),
        pickupDeadline: formData.get('pickupDeadline'),
        foodType: formData.get('foodType'),
        location: formData.get('location'),
        image: formData.get('image')
      });

      const imageUrl = await uploadDonationImage(parsed.image, user.uid);
      const aiRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parsed.title,
          quantity: parsed.quantity,
          pickupDeadline: parsed.pickupDeadline,
          foodType: parsed.foodType
        })
      });
      const ai = await aiRes.json();

      await createDonation({
        title: parsed.title,
        quantity: parsed.quantity,
        pickupDeadline: parsed.pickupDeadline,
        foodType: parsed.foodType,
        location: parsed.location,
        imageUrl,
        donorId: user.uid,
        donorName: user.displayName || user.email || 'Donor',
        ai
      });
    } finally {
      setSubmitting(false);
    }
  };

  const generateDemoData = async () => {
    if (!user) return;
    const demo = [
      { title: 'Paneer Biryani Trays', quantity: 20, foodType: 'veg' as const, location: 'Sector 18, Noida' },
      { title: 'Mixed Buffet Leftovers', quantity: 35, foodType: 'non-veg' as const, location: 'Koramangala, BLR' }
    ];

    for (const item of demo) {
      await createDonation({
        ...item,
        pickupDeadline: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString().slice(0, 16),
        imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
        donorId: user.uid,
        donorName: user.displayName || 'Demo Donor',
        ai: {
          safeConsumptionTime: 'Best before 3 hours',
          urgencyLevel: item.foodType === 'non-veg' ? 'HIGH' : 'MEDIUM',
          storageAdvice: 'Keep covered and refrigerated if possible.'
        }
      });
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-background p-6 dark:from-emerald-950/20">
        <Card className="mx-auto mt-20 max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">ZeroWaste Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Redistribute surplus food in real-time with AI safety insights.</p>
            <Button onClick={login} className="w-full">Continue with Google</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">ZeroWaste Connect</h1>
            <p className="text-muted-foreground">Welcome, {user.displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Total meals saved</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{impact.meals}</CardContent></Card>
          <Card><CardHeader><CardTitle>CO₂ reduced (kg)</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{impact.co2}</CardContent></Card>
          <Card><CardHeader><CardTitle>Donations today</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{impact.todayCount}</CardContent></Card>
        </section>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <Tabs value={role} onValueChange={(value) => setRole(value as 'donor' | 'ngo')}>
              <TabsList>
                <TabsTrigger value="donor">Donor Dashboard</TabsTrigger>
                <TabsTrigger value="ngo">NGO Dashboard</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={generateDemoData}>Demo Mode</Button>
          </CardContent>
        </Card>

        {role === 'donor' ? (
          <Card>
            <CardHeader><CardTitle>Create food donation</CardTitle></CardHeader>
            <CardContent>
              <form action={onCreateDonation} className="grid gap-3 md:grid-cols-2">
                <Input name="title" placeholder="Food title" required />
                <Input name="quantity" type="number" placeholder="Quantity (meals)" required />
                <Input name="pickupDeadline" type="datetime-local" required />
                <select name="foodType" className="h-10 rounded-md border bg-background px-3 text-sm" defaultValue="veg">
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-veg</option>
                </select>
                <Input name="location" placeholder="Pickup location" required />
                <Input name="image" type="file" accept="image/*" required />
                <Button disabled={submitting} className="md:col-span-2">{submitting ? 'Submitting...' : 'Create Donation'}</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          {donations.map((donation) => (
            <Card key={donation.id}>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{donation.title}</CardTitle>
                  <Badge className={urgencyClass(donation.ai?.urgencyLevel || 'LOW')}>
                    {(donation.ai?.urgencyLevel || 'LOW').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{donation.location} • {donation.quantity} meals • {donation.foodType}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <img src={donation.imageUrl} alt={donation.title} className="h-44 w-full rounded-md object-cover" />
                <p className="text-sm"><span className="font-semibold">Safe consumption:</span> {donation.ai?.safeConsumptionTime}</p>
                <p className="text-sm"><span className="font-semibold">Storage:</span> {donation.ai?.storageAdvice}</p>
                <div className="flex gap-2">
                  <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100">{donation.status.toUpperCase()}</Badge>
                  {role === 'ngo' && donation.status === 'available' ? (
                    <Button size="sm" onClick={() => updateDonationStatus(donation.id, 'accepted', user.displayName || user.email || 'NGO')}>Accept Pickup</Button>
                  ) : null}
                  {role === 'ngo' && donation.status === 'accepted' ? (
                    <Button size="sm" variant="outline" onClick={() => updateDonationStatus(donation.id, 'collected')}>Mark Collected</Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
