'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { Appointment, AppointmentStatus } from '@/types/database';

export interface CreateAppointmentInput {
  propertyId: string;
  hostId: string;
  visitDate: string;
  timeSlot: string;
  notes?: string;
}

export async function createAppointment(input: CreateAppointmentInput) {
  const { user, profile } = await getCurrentUser();
  if (!user || !profile) {
    return { error: 'Please sign in to schedule a site visit.' };
  }

  if (!input.propertyId || !input.hostId || !input.visitDate || !input.timeSlot) {
    return { error: 'Please select both a date and time slot.' };
  }

  // Prevent booking a visit on your own property
  if (user.id === input.hostId) {
    return { error: 'You cannot request a site visit for your own property.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      property_id: input.propertyId,
      requester_id: user.id,
      host_id: input.hostId,
      visit_date: input.visitDate,
      time_slot: input.timeSlot,
      notes: input.notes || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/properties/${input.propertyId}`);
  return { success: true, appointment: data as Appointment };
}

export async function getUserAppointments(): Promise<{
  asRequester: Appointment[];
  asHost: Appointment[];
}> {
  const { user } = await getCurrentUser();
  if (!user) return { asRequester: [], asHost: [] };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      property:properties(
        *,
        images:property_images(*)
      ),
      requester:profiles!appointments_requester_id_fkey(*),
      host:profiles!appointments_host_id_fkey(*)
    `)
    .or(`requester_id.eq.${user.id},host_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching appointments:', error);
    return { asRequester: [], asHost: [] };
  }

  const asRequester: Appointment[] = [];
  const asHost: Appointment[] = [];

  data.forEach((apt) => {
    if (apt.requester_id === user.id) {
      asRequester.push(apt as Appointment);
    }
    if (apt.host_id === user.id) {
      asHost.push(apt as Appointment);
    }
  });

  return { asRequester, asHost };
}

export async function confirmAppointment(appointmentId: string) {
  const { user, profile } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createClient();

  const { data: apt } = await supabase
    .from('appointments')
    .select('host_id')
    .eq('id', appointmentId)
    .single();

  if (!apt || (apt.host_id !== user.id && profile?.role !== 'admin')) {
    return { error: 'Permission denied. Only the property representative can confirm.' };
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function proposeAlternateSlot(
  appointmentId: string,
  alternateDate: string,
  alternateTimeSlot: string,
  hostNotes?: string
) {
  const { user, profile } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  if (!alternateDate || !alternateTimeSlot) {
    return { error: 'Please specify an alternate date and time slot.' };
  }

  const supabase = await createClient();

  const { data: apt } = await supabase
    .from('appointments')
    .select('host_id')
    .eq('id', appointmentId)
    .single();

  if (!apt || (apt.host_id !== user.id && profile?.role !== 'admin')) {
    return { error: 'Permission denied.' };
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'rescheduled',
      alternate_date: alternateDate,
      alternate_time_slot: alternateTimeSlot,
      host_notes: hostNotes || null,
    })
    .eq('id', appointmentId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function acceptAlternateSlot(appointmentId: string) {
  const { user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createClient();

  const { data: apt } = await supabase
    .from('appointments')
    .select('requester_id, alternate_date, alternate_time_slot')
    .eq('id', appointmentId)
    .single();

  if (!apt || apt.requester_id !== user.id) {
    return { error: 'Permission denied.' };
  }

  if (!apt.alternate_date || !apt.alternate_time_slot) {
    return { error: 'No alternate slot available to accept.' };
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      visit_date: apt.alternate_date,
      time_slot: apt.alternate_time_slot,
      status: 'confirmed',
      alternate_date: null,
      alternate_time_slot: null,
    })
    .eq('id', appointmentId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function declineAppointment(appointmentId: string, hostNotes?: string) {
  const { user, profile } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createClient();

  const { data: apt } = await supabase
    .from('appointments')
    .select('host_id')
    .eq('id', appointmentId)
    .single();

  if (!apt || (apt.host_id !== user.id && profile?.role !== 'admin')) {
    return { error: 'Permission denied.' };
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'declined',
      host_notes: hostNotes || null,
    })
    .eq('id', appointmentId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function cancelAppointment(appointmentId: string) {
  const { user, profile } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createClient();

  const { data: apt } = await supabase
    .from('appointments')
    .select('requester_id, host_id')
    .eq('id', appointmentId)
    .single();

  if (!apt) return { error: 'Appointment not found.' };

  const canCancel =
    apt.requester_id === user.id ||
    apt.host_id === user.id ||
    profile?.role === 'admin';

  if (!canCancel) return { error: 'Permission denied.' };

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}
