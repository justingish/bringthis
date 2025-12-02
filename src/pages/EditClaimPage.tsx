import { useParams } from 'react-router';

export default function EditClaimPage() {
  const { claimToken } = useParams<{ claimToken: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Your Claim</h1>
      <p className="text-gray-600">Claim Token: {claimToken}</p>
      {/* Claim edit functionality will be added in task 13 */}
    </div>
  );
}
