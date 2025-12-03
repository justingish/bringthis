import { formatEventDate } from '../utils/dateFormatter';

interface EventHeaderProps {
  title: string;
  date: Date | string;
  description: string;
}

/**
 * EventHeader component displays the event title, formatted date, and description.
 * Used on signup sheet view and edit pages.
 */
export function EventHeader({ title, date, description }: EventHeaderProps) {
  const formattedDate = formatEventDate(date);

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-lg text-gray-600 mb-4">
        <time dateTime={typeof date === 'string' ? date : date.toISOString()}>
          {formattedDate}
        </time>
      </p>
      {description && (
        <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
      )}
    </header>
  );
}
