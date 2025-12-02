import { useParams } from 'react-router';

export default function ViewSignupPage() {
  const { sheetId } = useParams<{ sheetId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">View Signup Sheet</h1>
      <p className="text-gray-600">Sheet ID: {sheetId}</p>
      {/* Sheet display implementation will be added in task 11 */}
    </div>
  );
}
