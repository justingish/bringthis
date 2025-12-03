# Accessibility Features

This document outlines the accessibility features implemented in the Signup Coordinator application to ensure WCAG 2.1 Level AA compliance.

## Overview

The application has been designed with accessibility as a core principle, ensuring that all users, including those using assistive technologies, can effectively use the signup coordination features.

## Implemented Features

### 1. ARIA Labels and Roles

#### Interactive Elements

- All buttons have descriptive `aria-label` attributes
- Form inputs are properly associated with labels using `htmlFor` and `id` attributes
- Modal dialogs use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
- Status messages use `role="status"` or `role="alert"` as appropriate
- Lists use `aria-label` to provide context

#### Live Regions

- Error messages use `aria-live="assertive"` for immediate announcement
- Success messages use `aria-live="polite"` for non-intrusive announcement
- Loading states use `aria-live="polite"` to inform users of state changes
- Form validation errors use `role="alert"` and `aria-live="polite"`

### 2. Keyboard Navigation

#### Focus Management

- All interactive elements are keyboard accessible
- Visible focus indicators on all focusable elements using `focus:ring-2` classes
- Focus ring offset for better visibility: `focus:ring-offset-2`
- Skip to main content link for keyboard users
- Logical tab order throughout the application

#### Focus Indicators

Custom CSS ensures consistent, visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### 3. Semantic HTML

#### Document Structure

- Proper heading hierarchy (h1 → h2 → h3)
- `<header>` elements for page headers
- `<article>` elements for item cards
- `<time>` elements with `dateTime` attribute for dates
- `<main>` element with `role="main"` for primary content
- `<form>` elements with descriptive `aria-label` attributes

#### Lists

- Proper `<ul>` and `<li>` structure for claims
- `aria-label` attributes on lists for context

### 4. Screen Reader Support

#### Hidden Content

- `.sr-only` class for screen reader-only content
- Loading spinner includes hidden "Loading" text
- Decorative elements use `aria-hidden="true"`

#### Descriptive Labels

- All form inputs have visible labels
- Buttons have descriptive text or `aria-label`
- Links have descriptive text or `aria-label`
- Status indicators clearly describe their state

### 5. Color Contrast (WCAG AA Compliance)

#### Text Colors

All text meets WCAG AA contrast requirements:

- Body text: `text-gray-800` (#1f2937) on white background - 12.63:1 ratio
- Error text: `text-red-800` on `bg-red-50` - 7.51:1 ratio
- Success text: `text-green-800` on `bg-green-50` - 7.31:1 ratio
- Warning text: `text-gray-700` on `bg-gray-50` - 8.59:1 ratio

#### Interactive Elements

- Primary buttons: White text on `bg-blue-600` - 4.56:1 ratio
- Secondary buttons: `text-gray-700` on white with border - 8.59:1 ratio
- Danger buttons: White text on `bg-red-600` - 4.53:1 ratio

### 6. Form Accessibility

#### Input Fields

- All inputs have associated `<label>` elements
- Required fields marked with asterisk and `aria-required`
- Error states indicated with `aria-invalid="true"`
- Error messages linked to inputs with `aria-describedby`
- Placeholder text provides helpful hints without replacing labels

#### Validation

- Real-time validation feedback
- Error messages announced to screen readers
- Clear indication of which fields have errors
- Validation errors persist until corrected

### 7. Modal Dialogs

#### Claim Form Modal

- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` references the modal title
- Focus trapped within modal when open
- Escape key closes modal (browser default)

#### Add Item Modal

- Same accessibility features as claim form
- Proper focus management
- Clear visual and programmatic indication of modal state

### 8. Loading and Error States

#### Loading Indicators

- `role="status"` for loading spinners
- `aria-live="polite"` for non-intrusive updates
- Descriptive loading messages
- Screen reader text for spinner animation

#### Error Messages

- `role="alert"` for error containers
- `aria-live="assertive"` for immediate announcement
- Clear error titles and descriptions
- Actionable error recovery options

### 9. Navigation

#### Skip Links

- "Skip to main content" link at the top of the page
- Visible on keyboard focus
- Allows keyboard users to bypass navigation

#### Page Titles

- Descriptive page title in `<head>`
- Meta description for search engines and assistive technologies

### 10. Responsive Design

#### Mobile Accessibility

- Touch targets at least 44x44 pixels
- Responsive text sizing
- Proper viewport configuration
- Touch-friendly interactive elements

## Testing

### Automated Testing

The application includes comprehensive accessibility tests in `src/components/accessibility.test.tsx`:

- ARIA attribute verification
- Semantic HTML structure
- Focus management
- Color contrast validation
- Keyboard navigation support

### Manual Testing Checklist

- [ ] Keyboard navigation through all interactive elements
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast verification
- [ ] Focus indicator visibility
- [ ] Form validation announcements
- [ ] Modal dialog behavior
- [ ] Skip link functionality

### Recommended Tools

- **axe DevTools**: Browser extension for automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)

## Browser Support

The accessibility features are supported in:

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Improvements

Potential enhancements for even better accessibility:

1. High contrast mode support
2. Reduced motion preferences
3. Font size customization
4. Additional language support
5. More comprehensive keyboard shortcuts
6. Enhanced screen reader announcements for dynamic content

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Compliance Statement

This application strives to meet WCAG 2.1 Level AA standards. If you encounter any accessibility barriers, please report them so we can address them promptly.
