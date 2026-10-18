import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dbUrl || !supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database successfully!');

    // Read and run schema.sql
    console.log('Applying database schema from supabase/schema.sql...');
    const schemaSql = fs.readFileSync('supabase/schema.sql', 'utf8');
    await client.query(schemaSql);
    console.log('Schema applied successfully!');

    // Close pg client for now, use Supabase Admin to seed users
    await client.end();

    console.log('Seeding demo users via Supabase Admin API...');
    const demoUsers = [
      {
        email: 'seller@estatia.com',
        password: 'Password123!',
        data: {
          full_name: 'Vikramaditya Singhania',
          role: 'seller',
          phone: '+91 98201 12345',
          bio: 'Property owner and real estate investor managing premier residential assets.',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
        }
      },
      {
        email: 'agent@estatia.com',
        password: 'Password123!',
        data: {
          full_name: 'Ananya Deshmukh',
          role: 'agent',
          phone: '+91 99302 98765',
          agency_name: 'Estatia Premier Estates',
          license_number: 'RERA-PRM-2024-8891',
          bio: 'Luxury real estate advisor specializing in South Mumbai & Bandra sea-facing residences.',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
        }
      },
      {
        email: 'buyer@estatia.com',
        password: 'Password123!',
        data: {
          full_name: 'Rohan Mehta',
          role: 'buyer',
          phone: '+91 98111 54321',
          bio: 'Tech entrepreneur seeking luxury penthouses and prime plots.',
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
        }
      },
      {
        email: 'tenant@estatia.com',
        password: 'Password123!',
        data: {
          full_name: 'Pooja Kashyap',
          role: 'tenant',
          phone: '+91 97112 67890',
          bio: 'Corporate consultant looking for fully furnished serviced apartments.',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        }
      },
      {
        email: 'admin@estatia.com',
        password: 'Password123!',
        data: {
          full_name: 'Estatia Chief Administrator',
          role: 'admin',
          phone: '+91 99999 00000',
          bio: 'Platform administration and listing compliance officer.',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
        }
      }
    ];

    const userMap = {};

    for (const u of demoUsers) {
      // Check if user exists
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existing = listData?.users?.find(x => x.email === u.email);

      let userId;
      if (existing) {
        userId = existing.id;
        console.log(`User already exists: ${u.email} (${userId})`);
        // update metadata & password
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: u.password,
          user_metadata: u.data
        });
      } else {
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: u.data
        });
        if (error) {
          console.error(`Failed to create ${u.email}:`, error.message);
        } else {
          userId = created.user.id;
          console.log(`Created user: ${u.email} (${userId})`);
        }
      }

      if (userId) {
        userMap[u.data.role] = userId;
        // Upsert into public.profiles directly to be 100% sure
        const { error: profileErr } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: userId,
            full_name: u.data.full_name,
            email: u.email,
            phone: u.data.phone,
            role: u.data.role,
            bio: u.data.bio,
            avatar_url: u.data.avatar_url,
            agency_name: u.data.agency_name || null,
            license_number: u.data.license_number || null
          });
        if (profileErr) {
          console.error(`Profile upsert error for ${u.email}:`, profileErr.message);
        }
      }
    }

    const sellerId = userMap['seller'];
    const agentId = userMap['agent'];
    const buyerId = userMap['buyer'];

    if (!sellerId) {
      throw new Error('Seller user was not created.');
    }

    // Connect agent to seller
    if (agentId && sellerId) {
      await supabaseAdmin.from('agent_landlords').upsert({
        agent_id: agentId,
        landlord_id: sellerId,
        status: 'approved'
      }, { onConflict: 'agent_id,landlord_id' });
      console.log('Linked Agent to Seller.');
    }

    // Seed Properties
    console.log('Seeding curated luxury and modern properties...');
    const propertiesData = [
      {
        title: 'The Skyward Sovereign Penthouse',
        description: 'Occupying the top two levels of a landmark tower, this duplex penthouse showcases uninterrupted 360-degree vistas of the Arabian Sea and city skyline. Features double-height ceilings, a private infinity terrace pool, custom Italian marble flooring, and bespoke acoustic screening.',
        listing_type: 'sale',
        property_type: 'villa',
        price: 285000000, // 28.5 Cr
        security_deposit: 0,
        address: 'Worli Sea Face, Tower 1',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip_code: '400018',
        country: 'India',
        latitude: 19.0178,
        longitude: 72.8178,
        area_sqft: 6800,
        bedrooms: 5,
        bathrooms: 6,
        amenities: ['Private Pool', 'Sea View', 'Concierge', 'Private Elevator', 'Smart Home Automation', 'Valet Parking', 'Wine Cellar', 'Gymnasium'],
        status: 'published',
        verification_status: 'verified',
        owner_id: sellerId,
        agent_id: agentId,
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80'
        ]
      },
      {
        title: 'Serenade Villa by the Coast',
        description: 'An idyllic colonial-contemporary private estate nestled amid swaying palms in North Goa. Boasts sprawling verandas, manicured Zen gardens, a heated lagoon pool, and high artisanal wooden ceilings. Perfect sanctuary or high-yield vacation rental.',
        listing_type: 'sale',
        property_type: 'villa',
        price: 120000000, // 12 Cr
        security_deposit: 0,
        address: 'Assagao Highlands, Badem Road',
        city: 'Goa',
        state: 'Goa',
        zip_code: '403507',
        country: 'India',
        latitude: 15.5898,
        longitude: 73.7744,
        area_sqft: 5200,
        bedrooms: 4,
        bathrooms: 5,
        amenities: ['Private Pool', 'Landscaped Garden', 'Solar Powered', 'Staff Quarters', 'Gated Community', 'Covered Carport', 'Outdoor Barbecue'],
        status: 'published',
        verification_status: 'verified',
        owner_id: sellerId,
        agent_id: agentId,
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&auto=format&fit=crop&q=80'
        ]
      },
      {
        title: 'The Orchard Modernist Residence',
        description: 'Located in Bengaluru prestigious Indiranagar, this architectural masterwork embraces indoor-outdoor biophilic living. Floor-to-ceiling glass pavilions open onto private courtyards and water features, paired with German kitchen fittings and climate control.',
        listing_type: 'rent',
        property_type: 'apartment',
        price: 275000, // 2.75 L/month
        security_deposit: 1500000,
        address: '100ft Road, Defence Colony, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        zip_code: '560038',
        country: 'India',
        latitude: 12.9784,
        longitude: 77.6408,
        area_sqft: 3400,
        bedrooms: 3,
        bathrooms: 4,
        amenities: ['Clubhouse', 'Swimming Pool', '24/7 Security', 'EV Charging', 'High Speed Fibre', 'Children Play Area', 'Visitor Parking'],
        status: 'published',
        verification_status: 'verified',
        owner_id: sellerId,
        agent_id: null,
        images: [
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&auto=format&fit=crop&q=80'
        ]
      },
      {
        title: 'The Heritage Court Boulevard Apartment',
        description: 'A stately 4-bedroom residence in South Delhis leafy diplomatic quarter. Features Burma teak flooring, ambient cove lighting, dedicated library den, and servant accommodation. Prime location with unmatched security.',
        listing_type: 'sale',
        property_type: 'apartment',
        price: 185000000, // 18.5 Cr
        security_deposit: 0,
        address: 'Shanti Path, Chanakyapuri',
        city: 'New Delhi',
        state: 'Delhi',
        zip_code: '110021',
        country: 'India',
        latitude: 28.5983,
        longitude: 77.1897,
        area_sqft: 4500,
        bedrooms: 4,
        bathrooms: 4,
        amenities: ['24/7 Power Backup', 'Gated Security', 'Dedicated Parking', 'Private Terrace', 'Modular Kitchen', 'Park Facing'],
        status: 'published',
        verification_status: 'verified',
        owner_id: sellerId,
        agent_id: agentId,
        images: [
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1600&auto=format&fit=crop&q=80'
        ]
      },
      {
        title: 'Boutique High-Street Commercial Suite',
        description: 'Premium grade-A commercial office plate ready for immediate corporate fitout. High footfall prominence, LEED Gold certified, with multi-level automated car parking and dedicated executive entrance.',
        listing_type: 'rent',
        property_type: 'commercial',
        price: 450000, // 4.5 L/month
        security_deposit: 2700000,
        address: 'Senapati Bapat Marg, Lower Parel',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip_code: '400013',
        country: 'India',
        latitude: 18.9986,
        longitude: 72.8311,
        area_sqft: 3800,
        bedrooms: 0,
        bathrooms: 3,
        amenities: ['Central Air Conditioning', 'High Speed Elevators', 'CCTV Surveillance', 'Conference Facility', 'Fire Safety Sprinklers', 'Power Backup'],
        status: 'published',
        verification_status: 'verified',
        owner_id: sellerId,
        agent_id: agentId,
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=80'
        ]
      },
      {
        title: 'Cyber Towers Panoramic Studio Penthouse',
        description: 'Compact ultra-chic serviced bachelor penthouse directly overlooking the HITEC City IT corridor. Fully furnished with Scandinavian furniture, smart lighting, and high-speed fibre connectivity.',
        listing_type: 'rent',
        property_type: 'apartment',
        price: 75000, // 75k/month
        security_deposit: 200000,
        address: 'Madhapur, HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        zip_code: '500081',
        country: 'India',
        latitude: 17.4474,
        longitude: 78.3762,
        area_sqft: 1450,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['Furnished', 'Swimming Pool', 'Gymnasium', 'Covered Parking', 'Balcony View', '24/7 Security'],
        status: 'published',
        verification_status: 'pending',
        owner_id: sellerId,
        agent_id: null,
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&auto=format&fit=crop&q=80'
        ]
      },
      {
        title: 'Kalyani Nagar Riverside Condominium',
        description: 'Picturesque riverside residence nestled in one of Punes greenest residential belts. Close to prime cafes, international schools, and airport expressway. Spacious deck with sunset vistas.',
        listing_type: 'sale',
        property_type: 'condo',
        price: 32000000, // 3.2 Cr
        security_deposit: 0,
        address: 'Central Avenue, Kalyani Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        zip_code: '411006',
        country: 'India',
        latitude: 18.5477,
        longitude: 73.9034,
        area_sqft: 2250,
        bedrooms: 3,
        bathrooms: 3,
        amenities: ['River View', 'Clubhouse', 'Children Play Area', 'Jogging Track', 'Intercom', 'Power Backup'],
        status: 'sold',
        verification_status: 'verified',
        owner_id: sellerId,
        agent_id: agentId,
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&auto=format&fit=crop&q=80'
        ]
      },
      {
        title: 'The Forest Hills Contemporary Villa [Draft]',
        description: 'New launch draft listing for upcoming gated enclave near Jubilee Hills.',
        listing_type: 'sale',
        property_type: 'villa',
        price: 95000000,
        security_deposit: 0,
        address: 'Road No. 36, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zip_code: '500033',
        country: 'India',
        latitude: 17.4326,
        longitude: 78.4071,
        area_sqft: 4800,
        bedrooms: 4,
        bathrooms: 5,
        amenities: ['Private Garden', 'Home Theatre', 'Solar Powered'],
        status: 'draft',
        verification_status: 'pending',
        owner_id: sellerId,
        agent_id: null,
        images: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&auto=format&fit=crop&q=80'
        ]
      }
    ];

    // Clear existing sample properties to avoid duplicate key issues on re-run
    console.log('Cleaning up old test properties...');
    await supabaseAdmin.from('properties').delete().eq('owner_id', sellerId);

    const insertedProperties = [];
    for (const p of propertiesData) {
      const { images, ...propInfo } = p;
      const { data: inserted, error: propErr } = await supabaseAdmin
        .from('properties')
        .insert(propInfo)
        .select()
        .single();

      if (propErr) {
        console.error(`Error inserting property ${p.title}:`, propErr.message);
        continue;
      }

      insertedProperties.push(inserted);

      // Insert images
      if (images && images.length > 0) {
        const imageRows = images.map((imgUrl, idx) => ({
          property_id: inserted.id,
          image_url: imgUrl,
          is_primary: idx === 0,
          display_order: idx
        }));
        const { error: imgErr } = await supabaseAdmin.from('property_images').insert(imageRows);
        if (imgErr) {
          console.error(`Error inserting images for ${p.title}:`, imgErr.message);
        }
      }
    }
    console.log(`Inserted ${insertedProperties.length} properties.`);

    // Seed favorites for buyer
    if (buyerId && insertedProperties.length >= 2) {
      console.log('Adding demo favorites for buyer...');
      await supabaseAdmin.from('favorites').upsert([
        { user_id: buyerId, property_id: insertedProperties[0].id },
        { user_id: buyerId, property_id: insertedProperties[1].id }
      ], { onConflict: 'user_id,property_id' });
      console.log('Favorites seeded for buyer.');
    }

    console.log('--- DATABASE SETUP & SEEDING COMPLETED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Fatal error during DB setup:', err);
    process.exit(1);
  }
}

main();
