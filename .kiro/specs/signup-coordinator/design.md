# Design Document

## Overview

The Signup Coordinator is a React-based web application that enables collaborative event planning through shareable signup sheets. The application uses a serverless architecture with Supabase for backend services (database and real-time subscriptions) and Netlify for hosting and continuous deployment. The design emphasizes simplicity, security through obscurity (cryptographically secure URLs), and real-time data synchronization.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   React SPA     │
│  (TypeScript)   │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Supabase      │
│   - PostgreSQL  │
│   - Realtime    │
│   - Row Level   │
│     Security    │
└─────────────────┘
```

### Technology Stack

- **Frontend**: React 19 with TypeScript, Vite for build tooling
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API + hooks for local state
- **Backend**: Supabase (PostgreSQL database with REST API)
- **Hosting**: Netlify with automatic deployments
- **Routing**: React Router v7 for client-side routing

### Deployment Architecture

- Netlify handles CI/CD from Git repository
- Environment variables stored in Netlify dashboard
- Supabase connection configured via environment variables
- Static assets served via Netlify CDN

## Components and Interfaces

### Page Components

#### 1. CreateSignupPage

- Form for creating new signup sheets
- Collects event details (title, date, description)
- Interface for adding signup items with quantity and field requirements
- Toggle for guest edit permissions
- Generates and displays shareable links upon creation

#### 2. ViewSignupPage

- Displays event details and signup items
- Shows current claim status for each item
- Provides claim interface for available items
- Conditionally shows "Add Item" button based on permissions
- Real-time updates when data changes

#### 3. EditSignupPage

- Protected by management token in URL
- Allows creator to modify event details
- Enables adding/removing/editing signup items
- Shows all current claims

#### 4. EditClaimPage

- Protected by claim-specific token in URL
- Allows guest to modify or cancel their claim
- Updates available quantities appropriately

### Core Components

#### SignupItemList

- Renders list of signup items
- Shows availability status
- Displays existing claims with guest information
- Props: `items`, `claims`, `onClaimItem`

#### ClaimForm

- Dynamic form based on item's required fields
- Validates required information
- Submits claim to database
- Props: `item`, `onSubmit`, `onCancel`

#### EventHeader

- Displays event title, date, and description
- Formatted date display
- Props: `title`, `date`, `description`

#### ItemCard

- Individual signup item display
- Shows item name, quantity needed/remaining
- Lists existing claims
- Claim button or "Full" indicator
- Props: `item`, `claims`, `onClaim`

### Utility Modules

#### supabaseClient.ts

- Initializes Supabase client with environment variables
- Exports configured client for use throughout app

#### tokenGenerator.ts

- Generates cryptographically secure random tokens
- Uses Web Crypto API for secure randomness

#### validators.ts

- Input validation functions
- Sanitization utilities for user-provided content

## Data Models

### Database Schema

#### signup_sheets

```typescript
{
  id: string (uuid, primary key)
  title: string (not null)
  event_date: date (not null)
  description: text
  allow_guest_additions: boolean (default false)
  management_token: string (unique, not null)
  created_at: timestamp
  updated_at: timestamp
}
```

#### signup_items

```typescript
{
  id: string (uuid, primary key)
  sheet_id: string (foreign key -> signup_sheets.id)
  item_name: string (not null)
  quantity_needed: integer (not null, > 0)
  require_name: boolean (default true)
  require_contact: boolean (default false)
  require_item_details: boolean (default false)
  created_at: timestamp
  display_order: integer
}
```

#### claims

```typescript
{
  id: string (uuid, primary key)
  item_id: string (foreign key -> signup_items.id)
  guest_name: string (not null)
  guest_contact: string (nullable)
  item_details: string (nullable)
  claim_token: string (unique, not null)
  created_at: timestamp
  updated_at: timestamp
}
```

### TypeScript Interfaces

```typescript
interface SignupSheet {
  id: string;
  title: string;
  eventDate: Date;
  description: string;
  allowGuestAdditions: boolean;
  managementToken: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SignupItem {
  id: string;
  sheetId: string;
  itemName: string;
  quantityNeeded: number;
  requireName: boolean;
  requireContact: boolean;
  requireItemDetails: boolean;
  displayOrder: number;
  createdAt: Date;
}

interface Claim {
  id: string;
  itemId: string;
  guestName: string;
  guestContact?: string;
  itemDetails?: string;
  claimToken: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClaimFormData {
  guestName: string;
  guestContact?: string;
  itemDetails?: string;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Signup sheet data round-trip

_For any_ valid signup sheet with event details (title, date, description), creating the sheet and then retrieving it should return all the same field values.
**Validates: Requirements 1.2, 1.4**

### Property 2: Generated links are unique

_For any_ set of created signup sheets and claims, all generated identifiers (sheet IDs, management tokens, and claim tokens) should be unique across the entire system.
**Validates: Requirements 1.3, 7.1, 8.1, 8.2, 9.1**

### Property 3: Signup items persist with configuration

_For any_ signup item with a name, quantity, and field requirements, adding it to a sheet should result in the item being retrievable with all configuration preserved.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 4: Claim form matches item requirements

_For any_ signup item, the claim form should include exactly the fields specified by the item's requireName, requireContact, and requireItemDetails flags.
**Validates: Requirements 2.4, 5.1**

### Property 5: Guest addition permission enforcement

_For any_ signup sheet, guests should be able to add items if and only if allowGuestAdditions is true.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 6: Available quantity calculation

_For any_ signup item with N quantity needed and M claims, the displayed available quantity should equal N - M.
**Validates: Requirements 4.3, 5.4**

### Property 7: Claim submission decreases availability

_For any_ signup item, successfully submitting a valid claim should decrease the available quantity by exactly 1.
**Validates: Requirements 5.4**

### Property 8: Full items reject new claims

_For any_ signup item where available quantity equals zero, attempting to submit a new claim should be rejected.
**Validates: Requirements 5.5**

### Property 9: Required field validation

_For any_ claim submission, if any required field (based on the item's configuration) is empty or missing, the submission should be rejected.
**Validates: Requirements 5.2**

### Property 10: Claim data round-trip

_For any_ valid claim with guest information, submitting the claim and then retrieving it should return all the same field values.
**Validates: Requirements 5.3**

### Property 11: Data freshness on read

_For any_ signup sheet, after modifications are made, subsequent reads should return the updated state.
**Validates: Requirements 6.1, 6.2**

### Property 12: Management token grants edit access

_For any_ signup sheet, requests with a valid management token should be authorized to modify the sheet, while requests without it should be denied.
**Validates: Requirements 7.2, 8.3**

### Property 13: Sheet updates persist

_For any_ signup sheet modification (event details or items), the changes should be retrievable after the update.
**Validates: Requirements 7.3**

### Property 14: Input sanitization

_For any_ user-submitted string containing HTML or script tags, the stored value should have those tags escaped or removed.
**Validates: Requirements 8.4**

### Property 15: Claim token grants claim edit access

_For any_ claim, requests with a valid claim token should be authorized to modify that specific claim, while requests without it should be denied.
**Validates: Requirements 9.2**

### Property 16: Claim cancellation restores quantity

_For any_ claim on a signup item, canceling the claim should increase the available quantity by exactly 1.
**Validates: Requirements 9.4**

### Property 17: Claim edit preserves quantity

_For any_ claim, modifying the claim details (name, contact, item details) without canceling should not change the available quantity for the item.
**Validates: Requirements 9.3**

## Error Handling

### Client-Side Error Handling

1. **Form Validation Errors**

   - Display inline validation messages for required fields
   - Prevent submission until all required fields are valid
   - Show clear error messages for invalid date formats

2. **Network Errors**

   - Display user-friendly error messages for failed API calls
   - Implement retry logic for transient failures
   - Show loading states during async operations

3. **Not Found Errors**

   - Display helpful message when signup sheet doesn't exist
   - Provide link to create a new sheet
   - Handle invalid tokens gracefully

4. **Capacity Errors**
   - Show clear message when item is full
   - Refresh data to show current availability
   - Suggest alternative items if available

### Server-Side Error Handling

1. **Database Errors**

   - Log errors for debugging
   - Return generic error messages to clients (don't expose internals)
   - Implement transaction rollback for failed operations

2. **Validation Errors**

   - Return 400 Bad Request with specific field errors
   - Validate all inputs before database operations
   - Sanitize inputs to prevent injection attacks

3. **Authorization Errors**

   - Return 403 Forbidden for invalid tokens
   - Don't reveal whether a resource exists if unauthorized
   - Log suspicious access attempts

4. **Rate Limiting**
   - Return 429 Too Many Requests when limits exceeded
   - Include Retry-After header
   - Implement exponential backoff on client

## Testing Strategy

### Unit Testing

The application will use **Vitest** as the testing framework for unit tests, chosen for its excellent TypeScript support, fast execution, and compatibility with Vite.

Unit tests will cover:

1. **Utility Functions**

   - Token generation produces valid format
   - Input sanitization removes dangerous content
   - Date formatting handles edge cases
   - Validation functions correctly identify invalid inputs

2. **Component Logic**

   - Form submission handlers process data correctly
   - Conditional rendering based on props
   - Event handlers call appropriate callbacks
   - State updates occur as expected

3. **Data Transformations**
   - Database models convert to TypeScript interfaces correctly
   - API responses parse into expected formats
   - Form data serializes correctly for submission

### Property-Based Testing

The application will use **fast-check** as the property-based testing library, which provides excellent TypeScript support and integrates well with Vitest.

Property-based tests will:

- Run a minimum of 100 iterations per property to ensure thorough coverage
- Use custom generators for domain-specific types (SignupSheet, SignupItem, Claim)
- Test the correctness properties defined in this document
- Each property-based test will include a comment tag referencing the specific correctness property it implements

Property-based tests will be tagged using this format:

```typescript
// Feature: signup-coordinator, Property 1: Signup sheet data round-trip
```

### Integration Testing

Integration tests will verify:

1. **Supabase Integration**

   - CRUD operations work correctly
   - Row-level security policies enforce access control
   - Real-time subscriptions deliver updates

2. **End-to-End Flows**

   - Complete signup sheet creation flow
   - Guest claiming items flow
   - Creator editing sheet flow
   - Guest editing claim flow

3. **Error Scenarios**
   - Network failures handled gracefully
   - Invalid tokens rejected
   - Concurrent claim attempts handled correctly

### Testing Environment

- Use Supabase local development environment for integration tests
- Mock Supabase client for unit tests
- Use test database separate from production
- Reset database state between test runs

## Security Considerations

### Authentication Strategy

The application uses "security through obscurity" with cryptographically secure tokens rather than traditional authentication:

1. **Token Generation**

   - Use Web Crypto API `crypto.getRandomValues()` for secure randomness
   - Generate 32-byte tokens encoded as URL-safe base64
   - Tokens are effectively unguessable (2^256 possible values)

2. **Token Types**
   - **Sheet ID**: Public identifier for viewing
   - **Management Token**: Grants edit access to sheet
   - **Claim Token**: Grants edit access to specific claim

### Data Protection

1. **Input Sanitization**

   - Escape HTML in all user-provided text
   - Validate data types and formats
   - Limit string lengths to prevent abuse

2. **SQL Injection Prevention**

   - Use Supabase parameterized queries
   - Never construct SQL from user input
   - Rely on Supabase client library's built-in protections

3. **XSS Prevention**
   - React's JSX automatically escapes content
   - Use `dangerouslySetInnerHTML` only with sanitized content
   - Set appropriate Content Security Policy headers

### Rate Limiting

Implement rate limiting at multiple levels:

1. **Netlify Edge Functions** (if used)

   - Limit requests per IP address
   - Implement exponential backoff

2. **Supabase**

   - Configure connection pooling limits
   - Set query timeout limits

3. **Client-Side**
   - Debounce form submissions
   - Prevent double-submission with loading states

### Privacy Considerations

1. **Data Minimization**

   - Only collect information specified by creator
   - Don't require email unless creator specifies contact info

2. **Data Retention**

   - Consider implementing automatic deletion of old sheets
   - Provide creator ability to delete their sheet

3. **Information Disclosure**
   - Guest information visible to all viewers (by design)
   - Don't expose management tokens in public views
   - Don't reveal whether a sheet exists if token is invalid

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**

   - Lazy load routes with React.lazy()
   - Split vendor bundles from application code

2. **Asset Optimization**

   - Minimize bundle size with tree shaking
   - Use Vite's built-in optimizations
   - Compress images and assets

3. **Rendering Optimization**
   - Use React.memo for expensive components
   - Implement virtual scrolling for long lists
   - Debounce expensive operations

### Backend Optimization

1. **Database Queries**

   - Use indexes on frequently queried columns (sheet_id, tokens)
   - Fetch only needed columns
   - Use joins to minimize round trips

2. **Caching**

   - Cache static assets with long TTL
   - Consider caching sheet data with short TTL
   - Use Supabase's built-in caching

3. **Real-time Updates**
   - Use Supabase real-time subscriptions efficiently
   - Unsubscribe when component unmounts
   - Batch updates when possible

## Accessibility

1. **Semantic HTML**

   - Use proper heading hierarchy
   - Use semantic elements (nav, main, article)
   - Provide alt text for images

2. **Keyboard Navigation**

   - All interactive elements keyboard accessible
   - Logical tab order
   - Visible focus indicators

3. **Screen Reader Support**

   - ARIA labels for dynamic content
   - Announce form errors
   - Provide context for interactive elements

4. **Visual Design**
   - Sufficient color contrast (WCAG AA)
   - Don't rely solely on color for information
   - Responsive text sizing

## Future Enhancements

Potential features for future iterations:

1. **Notifications**

   - Email notifications when items are claimed
   - Reminders as event date approaches

2. **Advanced Features**

   - Duplicate detection for similar items
   - Suggested items based on event type
   - Export to calendar (ICS file)

3. **Analytics**

   - Track sheet views
   - Monitor claim patterns
   - Popular item types

4. **Social Features**

   - Comments on items
   - Private messaging between creator and guests
   - Share to social media

5. **Mobile App**
   - Native mobile applications
   - Push notifications
   - Offline support
