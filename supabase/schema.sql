-- ====================================================================
-- ESTATIA: Real Estate Management System (REMS)
-- Database Schema for Supabase PostgreSQL (Idempotent)
-- Modules covered: 4.1 (Auth & Profiles), 4.2 (Listings), 4.3 (Search/Filter), Favorites
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles & Enums (Idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('buyer', 'tenant', 'seller', 'agent', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE listing_type AS ENUM ('sale', 'rent');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'condo', 'commercial', 'plot');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
        CREATE TYPE listing_status AS ENUM ('draft', 'published', 'occupied', 'sold');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
    END IF;
END $$;

-- 3. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'buyer',
    avatar_url TEXT,
    bio TEXT,
    agency_name TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AGENT - LANDLORD RELATIONSHIPS (REQ-4.1.7)
CREATE TABLE IF NOT EXISTS public.agent_landlords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(agent_id, landlord_id)
);

-- 5. PROPERTIES TABLE (REQ-4.2.1, REQ-4.2.4, REQ-4.2.6)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    listing_type listing_type NOT NULL,
    property_type property_type NOT NULL DEFAULT 'apartment',
    price NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
    security_deposit NUMERIC(14, 2) DEFAULT 0 CHECK (security_deposit >= 0),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area_sqft NUMERIC(10, 2) NOT NULL CHECK (area_sqft > 0),
    bedrooms INTEGER NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
    bathrooms INTEGER NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
    amenities TEXT[] NOT NULL DEFAULT '{}',
    status listing_status NOT NULL DEFAULT 'draft',
    verification_status verification_status NOT NULL DEFAULT 'pending',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PROPERTY IMAGES TABLE (REQ-4.2.2)
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. FAVORITES / SHORTLIST TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, property_id)
);

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area_sqft);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON public.favorites(property_id);

CREATE INDEX IF NOT EXISTS idx_properties_fts ON public.properties 
USING GIN (to_tsvector('english', title || ' ' || description || ' ' || city || ' ' || address));

-- 9. AUTOMATIC TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_properties_updated_at ON public.properties;
CREATE TRIGGER trigger_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. AUTH TRIGGER: CREATE PROFILE AUTOMATICALLY ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    raw_role text;
    assigned_role public.user_role;
    user_name text;
BEGIN
    raw_role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');
    IF raw_role IN ('buyer', 'tenant', 'seller', 'agent', 'admin') THEN
        assigned_role := raw_role::public.user_role;
    ELSE
        assigned_role := 'buyer'::public.user_role;
    END IF;

    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        avatar_url,
        agency_name,
        license_number
    ) VALUES (
        NEW.id,
        user_name,
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        assigned_role,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'agency_name',
        NEW.raw_user_meta_data->>'license_number'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Published properties are viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "Owners and agents can create listings" ON public.properties;
DROP POLICY IF EXISTS "Owners and agents can update their listings" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete their listings" ON public.properties;
DROP POLICY IF EXISTS "Images are viewable if property is accessible" ON public.property_images;
DROP POLICY IF EXISTS "Owners and agents can insert images" ON public.property_images;
DROP POLICY IF EXISTS "Owners and agents can delete images" ON public.property_images;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Published properties are viewable by everyone" 
ON public.properties FOR SELECT 
USING (
    status = 'published' 
    OR auth.uid() = owner_id 
    OR auth.uid() = agent_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Owners and agents can create listings" 
ON public.properties FOR INSERT 
WITH CHECK (
    auth.uid() = owner_id 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('seller', 'agent', 'admin')
    )
);

CREATE POLICY "Owners and agents can update their listings" 
ON public.properties FOR UPDATE 
USING (
    auth.uid() = owner_id 
    OR auth.uid() = agent_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Owners can delete their listings" 
ON public.properties FOR DELETE 
USING (
    auth.uid() = owner_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Images are viewable if property is accessible" 
ON public.property_images FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.properties p 
        WHERE p.id = property_id AND (
            p.status = 'published' 
            OR auth.uid() = p.owner_id 
            OR auth.uid() = p.agent_id
            OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
);

CREATE POLICY "Owners and agents can insert images" 
ON public.property_images FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.properties p 
        WHERE p.id = property_id AND (auth.uid() = p.owner_id OR auth.uid() = p.agent_id)
    )
);

CREATE POLICY "Owners and agents can delete images" 
ON public.property_images FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.properties p 
        WHERE p.id = property_id AND (auth.uid() = p.owner_id OR auth.uid() = p.agent_id)
    )
);

CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public property images view" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their property images" ON storage.objects;

CREATE POLICY "Public property images view" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their property images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'property-images' AND auth.uid() = owner);

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;



-- ====================================================================
-- ESTATIA: APPOINTMENTS TABLE (REQ-4.5 Site Visit Scheduling)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'declined', 'cancelled', 'completed')),
    notes TEXT,
    alternate_date DATE,
    alternate_time_slot TEXT,
    host_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_property_id ON public.appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_appointments_requester_id ON public.appointments(requester_id);
CREATE INDEX IF NOT EXISTS idx_appointments_host_id ON public.appointments(host_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_visit_date ON public.appointments(visit_date);

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
CREATE POLICY "Users can view their appointments" 
ON public.appointments FOR SELECT 
USING (
    auth.uid() = requester_id 
    OR auth.uid() = host_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Requesters can create appointments" ON public.appointments;
CREATE POLICY "Requesters can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Parties can update appointments" ON public.appointments;
CREATE POLICY "Parties can update appointments" 
ON public.appointments FOR UPDATE 
USING (
    auth.uid() = requester_id 
    OR auth.uid() = host_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

GRANT ALL ON public.appointments TO anon, authenticated, service_role;
