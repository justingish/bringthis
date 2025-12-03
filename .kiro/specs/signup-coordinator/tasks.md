# Implementation Plan

- [x] 1. Initialize project and setup development environment

  - Create new Vite + React + TypeScript project
  - Install dependencies: React 19, React Router v7, Tailwind CSS, Supabase client, Vitest, fast-check
  - Configure Tailwind CSS
  - Setup Supabase client configuration with environment variables
  - Create basic project structure (components, pages, utils, types directories)
  - _Requirements: 10.1, 10.3, 10.4_

- [x] 2. Setup Supabase database schema

  - Create signup_sheets table with all required columns
  - Create signup_items table with foreign key to signup_sheets
  - Create claims table with foreign key to signup_items
  - Add indexes on frequently queried columns (sheet_id, item_id, tokens)
  - Configure Row Level Security policies for public read access
  - _Requirements: 10.2_

- [x] 3. Implement core TypeScript types and interfaces

  - Define SignupSheet, SignupItem, Claim interfaces
  - Define ClaimFormData interface
  - Create type guards for runtime validation
  - _Requirements: 1.2, 2.1, 5.1_

- [x] 4. Implement utility functions
- [x] 4.1 Create token generator utility

  - Implement cryptographically secure token generation using Web Crypto API
  - Generate 32-byte URL-safe tokens
  - _Requirements: 1.3, 8.1, 8.2, 9.1_

- [x] 4.2 Write property test for token uniqueness

  - **Property 2: Generated links are unique**
  - **Validates: Requirements 1.3, 7.1, 8.1, 8.2, 9.1**

- [x] 4.3 Create input sanitization utility

  - Implement HTML escaping function
  - Implement input validation functions
  - _Requirements: 8.4_

- [x] 4.4 Write property test for input sanitization

  - **Property 14: Input sanitization**
  - **Validates: Requirements 8.4**

- [x] 4.5 Create date formatting utilities

  - Implement date parsing and formatting functions
  - Handle timezone considerations
  - _Requirements: 1.2_

- [x] 5. Implement database service layer
- [x] 5.1 Create signup sheet CRUD operations

  - Implement createSignupSheet function
  - Implement getSignupSheet function
  - Implement updateSignupSheet function
  - _Requirements: 1.2, 1.4, 7.3_

- [x] 5.2 Write property test for signup sheet round-trip

  - **Property 1: Signup sheet data round-trip**
  - **Validates: Requirements 1.2, 1.4**

- [x] 5.3 Write property test for sheet updates persist

  - **Property 13: Sheet updates persist**
  - **Validates: Requirements 7.3**

- [x] 5.4 Create signup item CRUD operations

  - Implement createSignupItem function
  - Implement getSignupItemsBySheetId function
  - Implement updateSignupItem function
  - Implement deleteSignupItem function
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.5 Write property test for signup items persist

  - **Property 3: Signup items persist with configuration**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 5.6 Create claim CRUD operations

  - Implement createClaim function with quantity validation
  - Implement getClaimsByItemId function
  - Implement getClaimByToken function
  - Implement updateClaim function
  - Implement deleteClaim function
  - _Requirements: 5.2, 5.3, 5.4, 9.2, 9.3, 9.4_

- [x] 5.7 Write property test for claim round-trip

  - **Property 10: Claim data round-trip**
  - **Validates: Requirements 5.3**

- [x] 5.8 Write property test for claim submission decreases availability

  - **Property 7: Claim submission decreases availability**
  - **Validates: Requirements 5.4**

- [x] 5.9 Write property test for claim cancellation restores quantity

  - **Property 16: Claim cancellation restores quantity**
  - **Validates: Requirements 9.4**

- [x] 5.10 Write property test for claim edit preserves quantity

  - **Property 17: Claim edit preserves quantity**
  - **Validates: Requirements 9.3**

- [x] 6. Implement availability calculation logic
- [x] 6.1 Create function to calculate available quantity

  - Implement logic: available = quantityNeeded - claimCount
  - Handle edge cases (negative values, null checks)
  - _Requirements: 4.3, 5.4_

- [x] 6.2 Write property test for available quantity calculation

  - **Property 6: Available quantity calculation**
  - **Validates: Requirements 4.3, 5.4**

- [x] 6.3 Create function to check if item is full

  - Implement validation to prevent claims when quantity is zero
  - _Requirements: 5.5_

- [x] 6.4 Write property test for full items reject claims

  - **Property 8: Full items reject new claims**
  - **Validates: Requirements 5.5**

- [x] 7. Implement form validation logic
- [x] 7.1 Create claim form validation function

  - Validate required fields based on item configuration
  - Return specific error messages for each field
  - _Requirements: 5.2_

- [x] 7.2 Write property test for required field validation

  - **Property 9: Required field validation**
  - **Validates: Requirements 5.2**

- [x] 8. Setup routing with React Router v7

  - Configure router with routes for all pages
  - Setup route for CreateSignupPage (/)
  - Setup route for ViewSignupPage (/sheet/:sheetId)
  - Setup route for EditSignupPage (/sheet/:sheetId/edit/:managementToken)
  - Setup route for EditClaimPage (/claim/:claimToken)
  - Setup 404 Not Found page
  - _Requirements: 1.1, 4.1, 7.2, 9.2_

- [x] 9. Implement shared components
- [x] 9.1 Create EventHeader component

  - Display event title, formatted date, and description
  - Style with Tailwind CSS
  - _Requirements: 4.1_

- [x] 9.2 Create ItemCard component

  - Display item name, quantity needed/remaining
  - Show list of existing claims with guest information
  - Display "Claim" button or "Full" indicator
  - Handle click events for claiming
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 9.3 Create SignupItemList component

  - Render list of ItemCard components
  - Handle empty state
  - _Requirements: 4.2_

- [x] 9.4 Create ClaimForm component

  - Dynamically render fields based on item requirements
  - Implement form validation
  - Handle form submission
  - Display validation errors
  - _Requirements: 2.4, 5.1, 5.2_

- [x] 9.5 Write property test for claim form matches requirements

  - **Property 4: Claim form matches item requirements**
  - **Validates: Requirements 2.4, 5.1**

- [x] 10. Implement CreateSignupPage
- [x] 10.1 Create page component with form for event details

  - Input fields for title, date, description
  - Section for adding signup items
  - Toggle for guest addition permissions
  - Submit button to create sheet
  - _Requirements: 1.1, 1.2, 3.1_

- [x] 10.2 Implement add signup item functionality

  - Form to add item name and quantity
  - Checkboxes for field requirements (name, contact, item details)
  - Add item to local state
  - Display list of added items with remove option
  - _Requirements: 2.1, 2.2_

- [x] 10.3 Implement form submission handler

  - Validate all required fields
  - Call createSignupSheet service function
  - Generate and display shareable links (view and management)
  - Handle errors and display messages
  - _Requirements: 1.3, 1.4_

- [x] 11. Implement ViewSignupPage
- [x] 11.1 Create page component to display signup sheet

  - Fetch signup sheet data by ID from URL params
  - Display EventHeader component
  - Display SignupItemList component
  - Handle loading and error states
  - _Requirements: 4.1, 4.2_

- [x] 11.2 Implement claim item functionality

  - Show ClaimForm modal when item is clicked
  - Submit claim to database
  - Refresh page data after successful claim
  - Display success message with claim edit link
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 11.3 Write property test for data freshness

  - **Property 11: Data freshness on read**
  - **Validates: Requirements 6.1, 6.2**

- [x] 11.4 Implement guest add item functionality (conditional)

  - Show "Add Item" button if allowGuestAdditions is true
  - Display form to add new item
  - Submit new item to database
  - Refresh page data
  - _Requirements: 3.2, 3.3_

- [x] 11.5 Write property test for guest addition permission

  - **Property 5: Guest addition permission enforcement**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 12. Implement EditSignupPage
- [x] 12.1 Create page component for editing signup sheet

  - Validate management token from URL params
  - Fetch signup sheet data
  - Display editable form for event details
  - Display list of signup items with edit/delete options
  - Handle unauthorized access (invalid token)
  - _Requirements: 7.1, 7.2, 8.3_

- [x] 12.2 Write property test for management token authorization

  - **Property 12: Management token grants edit access**
  - **Validates: Requirements 7.2, 8.3**

- [x] 12.3 Implement update functionality

  - Save changes to event details
  - Add/edit/delete signup items
  - Display all current claims (read-only)
  - Show success messages after updates
  - _Requirements: 7.3_

- [x] 13. Implement EditClaimPage
- [x] 13.1 Create page component for editing claim

  - Validate claim token from URL params
  - Fetch claim data
  - Display editable form with current values
  - Handle unauthorized access (invalid token)
  - _Requirements: 9.1, 9.2_

- [x] 13.2 Write property test for claim token authorization

  - **Property 15: Claim token grants claim edit access**
  - **Validates: Requirements 9.2**

- [x] 13.3 Implement update and cancel functionality

  - Save changes to claim details
  - Implement cancel claim button
  - Update available quantities appropriately
  - Redirect after successful update/cancel
  - _Requirements: 9.3, 9.4_

- [x] 14. Implement error handling and loading states

  - Add error boundaries for React components
  - Display user-friendly error messages
  - Implement loading spinners for async operations
  - Handle network errors with retry options
  - Handle 404 errors for invalid sheet/claim IDs
  - _Requirements: All_

- [x] 15. Implement accessibility features

  - Add ARIA labels to interactive elements
  - Ensure keyboard navigation works throughout
  - Add focus indicators
  - Test with screen reader
  - Verify color contrast meets WCAG AA standards
  - _Requirements: All_

- [x] 16. Setup Netlify deployment

  - Create netlify.toml configuration file
  - Configure build command and publish directory
  - Setup environment variables in Netlify dashboard
  - Configure redirects for client-side routing
  - Test deployment
  - _Requirements: 10.3, 10.4_

- [x] 17. Final checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Fix any failing tests
  - Verify all correctness properties are validated
  - Test end-to-end flows manually
  - Ask the user if questions arise
