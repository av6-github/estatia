'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { Property, PropertyType, ListingType, ListingStatus, VerificationStatus } from '@/types/database';
import { getUserAppointments } from '@/app/actions/appointments';

export interface PropertyFilterOptions {
  query?: string;
  city?: string;
  listingType?: ListingType | 'all';
  propertyType?: PropertyType | 'all';
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  amenities?: string[];
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';
  status?: ListingStatus | 'all';
}

export async function getProperties(filters: PropertyFilterOptions = {}): Promise<Property[]> {
  try {
    const supabase = await createClient();
    const { user } = await getCurrentUser();

    let query = supabase
      .from('properties')
      .select(`
        *,
        images:property_images(*),
        owner:profiles!properties_owner_id_fkey(*),
        agent:profiles!properties_agent_id_fkey(*)
      `);

    // Status filter - by default only published properties for public browse
    if (!filters.status || filters.status === 'published') {
      query = query.eq('status', 'published');
    } else if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Listing Type (sale / rent)
    if (filters.listingType && filters.listingType !== 'all') {
      query = query.eq('listing_type', filters.listingType);
    }

    // Property Type
    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('property_type', filters.propertyType);
    }

    // City
    if (filters.city && filters.city !== 'all') {
      query = query.ilike('city', `%${filters.city}%`);
    }

    // Price range
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      query = query.lte('price', filters.maxPrice);
    }

    // Bedrooms
    if (filters.minBedrooms !== undefined && filters.minBedrooms > 0) {
      query = query.gte('bedrooms', filters.minBedrooms);
    }

    // Keyword search (REQ-4.3.1)
    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.trim();
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,address.ilike.%${q}%`);
    }

    // Sorting (REQ-4.3.3)
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'area_asc':
        query = query.order('area_sqft', { ascending: true });
        break;
      case 'area_desc':
        query = query.order('area_sqft', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    // If user is logged in, attach is_favorited status
    if (user && data && data.length > 0) {
      const { data: userFavs } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      const favSet = new Set(userFavs?.map(f => f.property_id) || []);
      return data.map(p => ({
        ...p,
        is_favorited: favSet.has(p.id),
      }));
    }

    return (data as Property[]) || [];
  } catch (err) {
    console.error('Unexpected error fetching properties:', err);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const supabase = await createClient();
    const { user } = await getCurrentUser();

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        images:property_images(*),
        owner:profiles!properties_owner_id_fkey(*),
        agent:profiles!properties_agent_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;

    let isFavorited = false;
    if (user) {
      const { data: fav } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', id)
        .maybeSingle();

      isFavorited = !!fav;
    }

    return {
      ...data,
      is_favorited: isFavorited,
    };
  } catch (err) {
    console.error('Error fetching property by id:', err);
    return null;
  }
}

export async function toggleFavorite(propertyId: string) {
  const { user } = await getCurrentUser();
  if (!user) {
    return { error: 'Please login to add this property to your favorites.' };
  }

  const supabase = await createClient();

  // Check if exists
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    revalidatePath('/favorites');
    revalidatePath(`/properties/${propertyId}`);
    return { favorited: false };
  } else {
    await supabase.from('favorites').insert({
      user_id: user.id,
      property_id: propertyId,
    });
    revalidatePath('/favorites');
    revalidatePath(`/properties/${propertyId}`);
    return { favorited: true };
  }
}

export async function getUserFavorites(): Promise<Property[]> {
  const { user } = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      property:properties(
        *,
        images:property_images(*),
        owner:profiles!properties_owner_id_fkey(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data
    .map(f => f.property as unknown as Property)
    .filter(Boolean)
    .map(p => ({ ...p, is_favorited: true }));
}

export async function createProperty(formData: FormData) {
  const { user, profile } = await getCurrentUser();
  if (!user || !profile) return { error: 'Unauthorized. Please login.' };

  // Only sellers, agents, or admin can create listings per REQ-5.5 Business Rules
  if (!['seller', 'agent', 'admin'].includes(profile.role)) {
    return { error: 'Only Sellers, Landlords, or Agents have permission to create property listings.' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const listing_type = formData.get('listing_type') as ListingType;
  const property_type = formData.get('property_type') as PropertyType;
  const price = parseFloat(formData.get('price') as string) || 0;
  const security_deposit = parseFloat(formData.get('security_deposit') as string) || 0;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const zip_code = formData.get('zip_code') as string;
  const area_sqft = parseFloat(formData.get('area_sqft') as string) || 0;
  const bedrooms = parseInt(formData.get('bedrooms') as string, 10) || 0;
  const bathrooms = parseInt(formData.get('bathrooms') as string, 10) || 0;
  const amenitiesString = formData.get('amenities') as string;
  const imageUrlsString = formData.get('image_urls') as string;
  const shouldPublish = formData.get('publish') === 'true';

  if (!title || !description || !price || !address || !city || !area_sqft) {
    return { error: 'Please fill in all mandatory fields.' };
  }

  const amenities = amenitiesString
    ? amenitiesString.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const imageUrls = imageUrlsString
    ? imageUrlsString.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  // REQ-4.2.2: Require at least one photo before publishing
  if (shouldPublish && imageUrls.length === 0) {
    return { error: 'Per REQ-4.2.2, a property listing requires at least one photograph before it can be published.' };
  }

  const initialStatus: ListingStatus = shouldPublish ? 'published' : 'draft';

  const supabase = await createClient();

  const propertyPayload = {
    title,
    description,
    listing_type,
    property_type,
    price,
    security_deposit,
    address,
    city,
    state: state || 'State',
    zip_code: zip_code || '000000',
    area_sqft,
    bedrooms,
    bathrooms,
    amenities,
    status: initialStatus,
    verification_status: 'pending' as VerificationStatus,
    owner_id: user.id,
    agent_id: profile.role === 'agent' ? user.id : null,
  };

  const { data: newProp, error: propErr } = await supabase
    .from('properties')
    .insert(propertyPayload)
    .select()
    .single();

  if (propErr || !newProp) {
    return { error: propErr?.message || 'Failed to create property listing.' };
  }

  // Insert images
  if (imageUrls.length > 0) {
    const imgRows = imageUrls.map((url, idx) => ({
      property_id: newProp.id,
      image_url: url,
      is_primary: idx === 0,
      display_order: idx,
    }));
    await supabase.from('property_images').insert(imgRows);
  }

  revalidatePath('/properties');
  revalidatePath('/dashboard');
  return { success: true, propertyId: newProp.id };
}

export async function updateProperty(propertyId: string, formData: FormData) {
  const { user, profile } = await getCurrentUser();
  if (!user || !profile) return { error: 'Unauthorized. Please login.' };

  const supabase = await createClient();

  // Verify ownership or agent assignment
  const { data: prop } = await supabase
    .from('properties')
    .select('owner_id, agent_id, status')
    .eq('id', propertyId)
    .single();

  if (!prop) return { error: 'Property not found.' };

  const canEdit =
    prop.owner_id === user.id ||
    prop.agent_id === user.id ||
    profile.role === 'admin';

  if (!canEdit) return { error: 'Permission denied. Only the owner or assigned agent can edit this listing.' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const listing_type = formData.get('listing_type') as ListingType;
  const property_type = formData.get('property_type') as PropertyType;
  const price = parseFloat(formData.get('price') as string) || 0;
  const security_deposit = parseFloat(formData.get('security_deposit') as string) || 0;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const zip_code = formData.get('zip_code') as string;
  const area_sqft = parseFloat(formData.get('area_sqft') as string) || 0;
  const bedrooms = parseInt(formData.get('bedrooms') as string, 10) || 0;
  const bathrooms = parseInt(formData.get('bathrooms') as string, 10) || 0;
  const amenitiesString = formData.get('amenities') as string;
  const imageUrlsString = formData.get('image_urls') as string;
  const shouldPublish = formData.get('publish') === 'true';

  if (!title || !description || !price || !address || !city || !area_sqft) {
    return { error: 'Please fill in all mandatory fields.' };
  }

  const amenities = amenitiesString
    ? amenitiesString.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const imageUrls = imageUrlsString
    ? imageUrlsString.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  if (shouldPublish && imageUrls.length === 0) {
    return { error: 'Per REQ-4.2.2, a property listing requires at least one photograph before it can be published.' };
  }

  const targetStatus: ListingStatus = shouldPublish ? 'published' : 'draft';

  const updatePayload = {
    title,
    description,
    listing_type,
    property_type,
    price,
    security_deposit,
    address,
    city,
    state: state || 'State',
    zip_code: zip_code || '000000',
    area_sqft,
    bedrooms,
    bathrooms,
    amenities,
    status: targetStatus,
  };

  const { error: updateErr } = await supabase
    .from('properties')
    .update(updatePayload)
    .eq('id', propertyId);

  if (updateErr) {
    return { error: updateErr.message };
  }

  // Update images if provided
  if (imageUrls.length > 0) {
    await supabase.from('property_images').delete().eq('property_id', propertyId);

    const imgRows = imageUrls.map((url, idx) => ({
      property_id: propertyId,
      image_url: url,
      is_primary: idx === 0,
      display_order: idx,
    }));
    await supabase.from('property_images').insert(imgRows);
  }

  revalidatePath('/properties');
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath('/dashboard');
  return { success: true, propertyId };
}

export async function updatePropertyStatus(propertyId: string, status: ListingStatus) {
  const { user, profile } = await getCurrentUser();
  if (!user || !profile) return { error: 'Unauthorized' };

  const supabase = await createClient();

  // Verify owner or agent or admin
  const { data: prop } = await supabase
    .from('properties')
    .select('owner_id, agent_id, images:property_images(id)')
    .eq('id', propertyId)
    .single();

  if (!prop) return { error: 'Property not found.' };

  const canEdit =
    prop.owner_id === user.id ||
    prop.agent_id === user.id ||
    profile.role === 'admin';

  if (!canEdit) return { error: 'Permission denied.' };

  // REQ-4.2.2: Cannot publish if zero images
  if (status === 'published' && (!prop.images || prop.images.length === 0)) {
    return { error: 'Listing must have at least one photo before publishing.' };
  }

  const { error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', propertyId);

  if (error) return { error: error.message };

  revalidatePath('/properties');
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteProperty(propertyId: string) {
  const { user, profile } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createClient();

  const { data: prop } = await supabase
    .from('properties')
    .select('owner_id, agent_id')
    .eq('id', propertyId)
    .single();

  if (!prop) return { error: 'Property not found.' };

  const canDelete =
    prop.owner_id === user.id ||
    profile?.role === 'admin';

  if (!canDelete) return { error: 'Permission denied.' };

  const { error } = await supabase.from('properties').delete().eq('id', propertyId);
  if (error) return { error: error.message };

  revalidatePath('/properties');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getDashboardData() {
  const { user, profile } = await getCurrentUser();
  if (!user || !profile) return null;

  const supabase = await createClient();

  if (profile.role === 'seller' || profile.role === 'agent') {
    const field = profile.role === 'seller' ? 'owner_id' : 'agent_id';
    const { data: listings } = await supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq(field, user.id)
      .order('created_at', { ascending: false });

    const { asHost: appointments } = await getUserAppointments();

    return {
      profile,
      listings: (listings as Property[]) || [],
      appointments: appointments || [],
    };
  }

  if (profile.role === 'buyer' || profile.role === 'tenant') {
    const favorites = await getUserFavorites();
    const { asRequester: appointments } = await getUserAppointments();

    return {
      profile,
      favorites,
      appointments: appointments || [],
    };
  }

  if (profile.role === 'admin') {
    const { data: allListings } = await supabase
      .from('properties')
      .select('*, owner:profiles!properties_owner_id_fkey(*)')
      .order('created_at', { ascending: false });

    const { data: allUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: allAppointments } = await supabase
      .from('appointments')
      .select(`
        *,
        property:properties(*),
        requester:profiles!appointments_requester_id_fkey(*),
        host:profiles!appointments_host_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    return {
      profile,
      allListings: (allListings as Property[]) || [],
      allUsers: (allUsers || []),
      appointments: allAppointments || [],
    };
  }

  return { profile };
}

export async function verifyProperty(propertyId: string, status: VerificationStatus) {
  const { user, profile } = await getCurrentUser();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Only Administrators can verify property documents and listings.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('properties')
    .update({ verification_status: status })
    .eq('id', propertyId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}
