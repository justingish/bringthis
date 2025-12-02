import { useParams } from 'react-router';

export default function EditSignupPage() {
  const { sheetId, managementToken } = useParams<{
    sheetId: string;
    managementToken: string;
  }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Signup Sheet</h1>
      <p className="text-gray-600">Sheet ID: {sheetId}</p>
      <p className="text-gray-600">Management Token: {managementToken}</p>
      {/* Edit functionality will be added in task 12 */}
    </div>
  );
}
