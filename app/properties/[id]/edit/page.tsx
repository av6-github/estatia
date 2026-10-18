import { getPropertyById } from '@/app/actions/properties';
import { getCurrentUser } from '@/app/actions/auth';
import EditPropertyForm from '@/components/EditPropertyForm';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const canEdit =
    property.owner_id === user.id ||
    property.agent_id === user.id ||
    profile.role === 'admin';

  if (!canEdit) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-10 border border-[#8DA9C4]/30 shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-heritage text-3xl font-bold text-[#0B2545]">
            Permission Denied
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
            You do not have administrative authorization to modify this listing. Only the verified property owner or the assigned certified agent can make changes.
          </p>
          <div className="pt-4">
            <Link
              href={`/properties/${property.id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Listing</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <EditPropertyForm property={property} />;
}
