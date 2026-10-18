'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { UserRole, Profile } from '@/types/database';
import type { User } from '@supabase/supabase-js';

export async function getCurrentUser(): Promise<{ user: User | null; profile: Profile | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile: profile || null };
  } catch (err) {
    console.error('Error getting current user:', err);
    return { user: null, profile: null };
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // REQ-4.1.4: Generic error message that does not reveal whether email or password was wrong
    return { error: 'Invalid login credentials. Please check your email and password.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const phone = (formData.get('phone') as string) || '';
  const role = (formData.get('role') as UserRole) || 'buyer';
  const agencyName = (formData.get('agency_name') as string) || null;
  const licenseNumber = (formData.get('license_number') as string) || null;

  if (!email || !password || !fullName) {
    return { error: 'Please fill in all mandatory registration fields.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role,
        agency_name: agencyName,
        license_number: licenseNumber,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure profile is synced
  if (data.user) {
    const admin = createAdminClient();
    await admin.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      email,
      phone: phone || null,
      role,
      agency_name: agencyName,
      license_number: licenseNumber,
    });
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

// 1-Click Demo Login for smooth testing across profiles
export async function demoLogin(role: UserRole) {
  const roleEmails: Record<UserRole, string> = {
    seller: 'seller@estatia.com',
    agent: 'agent@estatia.com',
    buyer: 'buyer@estatia.com',
    tenant: 'tenant@estatia.com',
    admin: 'admin@estatia.com',
  };

  const email = roleEmails[role];
  const password = 'Password123!';

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: `Demo login failed: ${error.message}` };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function updateProfile(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const fullName = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const bio = formData.get('bio') as string;
  const avatarUrl = formData.get('avatar_url') as string;
  const agencyName = formData.get('agency_name') as string;
  const licenseNumber = formData.get('license_number') as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      agency_name: agencyName || null,
      license_number: licenseNumber || null,
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { success: true };
}
