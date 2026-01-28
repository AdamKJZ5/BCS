# Bellevue Collision Services - Testing Checklist

## Test Environment Setup

### Prerequisites
- MongoDB running locally or connection string configured
- Server running on http://localhost:5000
- Client running on http://localhost:5173
- At least one admin user in database

### Environment Variables Required
```
# Server (.env)
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<secure-random-string>
EMAIL_USER=<smtp-email-address>
EMAIL_PASSWORD=<smtp-password>
CORS_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:5000

# Client (.env)
VITE_API_BASE_URL=http://localhost:5000
```

---

## 1. Public Website Tests

### Home Page (`/`)
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] Services preview shows 3 featured services
- [ ] "Get Free Quote" CTA button navigates to /contact
- [ ] Navigation menu works on desktop and mobile
- [ ] Footer displays business info and links

### Services Page (`/services`)
- [ ] All services display with images
- [ ] Service cards are responsive (grid layout)
- [ ] Images are clear and edge-to-edge (320px height)
- [ ] Hover effects work on service cards
- [ ] "Get a Quote" button navigates to /contact

### Gallery Page (`/gallery`)
- [ ] Gallery loads photos from backend
- [ ] Filter buttons work (All, Collision, Painting, Dent)
- [ ] Photos display in responsive grid
- [ ] Click on photo opens modal with full-size image
- [ ] Modal close button works
- [ ] Empty state shows when no photos in category
- [ ] Loading state displays while fetching

### About Page (`/about`)
- [ ] Page content displays correctly
- [ ] Images and text are well-formatted
- [ ] Links work properly

### Contact Page (`/contact`)
- [ ] Form displays all fields (name, email, phone, message)
- [ ] Photo upload accepts up to 3 images
- [ ] Form validation works (required fields)
- [ ] Form submission creates lead in database
- [ ] Success message displays after submission
- [ ] Email notification sent to business
- [ ] Customer account created automatically
- [ ] Signup email sent to customer
- [ ] Error handling displays appropriate messages

---

## 2. Customer Portal Tests

### Registration (`/customer/register`)
- [ ] Registration form displays correctly
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Successful registration logs user in
- [ ] User redirected to dashboard after registration
- [ ] Token and user stored in localStorage
- [ ] Authentication persists after page refresh

### Login (`/customer/login`)
- [ ] Login form displays correctly
- [ ] Email/password validation works
- [ ] Successful login redirects to dashboard
- [ ] Token and user stored in localStorage
- [ ] "Stay logged in" functionality works
- [ ] Authentication persists after browser close/reopen
- [ ] Invalid credentials show error message

### Customer Dashboard (`/customer/dashboard`)
- [ ] Dashboard requires authentication (redirects to login if not)
- [ ] Welcome message shows user's name
- [ ] Service requests section displays user's leads
- [ ] Each lead shows: date, service type, status, tracking info
- [ ] Repair tracking displays when available
- [ ] Empty state shows for users with no service requests
- [ ] Logout button works and clears authentication

### Complete Signup (`/customer/complete-signup/:token`)
- [ ] Page loads with valid token
- [ ] User can set password
- [ ] Password requirements enforced
- [ ] Successful password setup logs user in
- [ ] User redirected to dashboard
- [ ] Invalid/expired token shows error message

---

## 3. Admin Panel Tests

### Admin Login (`/admin/login`)
- [ ] Login form displays correctly
- [ ] Only users with "admin" role can login
- [ ] Non-admin users see "Access denied" message
- [ ] Successful login redirects to /admin/dashboard
- [ ] Token stored in localStorage
- [ ] Authentication persists after refresh

### Admin Layout & Navigation
- [ ] Admin sidebar displays on all admin pages
- [ ] Sidebar shows admin user name and email
- [ ] Navigation links work (Dashboard, Leads, Settings, Gallery)
- [ ] Logout button works and redirects to /admin/login
- [ ] Protected routes redirect to login if not authenticated
- [ ] Non-admin users redirected to home page

### Admin Dashboard (`/admin/dashboard`)
- [ ] Statistics display correctly (total, new, in progress, completed)
- [ ] Recent leads table shows last 10 leads
- [ ] Lead status badges display correct colors
- [ ] "View All Leads" button navigates to /admin/leads
- [ ] Dashboard refreshes data on load

### Leads Management (`/admin/leads`)
- [ ] All leads display in table format
- [ ] Table columns: Date, Customer, Service, Status, Contact, Actions
- [ ] "View Details" button opens lead detail modal
- [ ] Status dropdown allows changing lead status
- [ ] Status changes save to database
- [ ] Notes section allows adding admin notes
- [ ] Notes display with timestamps
- [ ] Photos display in modal when available
- [ ] Repair tracking form works:
  - [ ] Can update current step
  - [ ] Can update estimated completion date
  - [ ] Can add progress notes
  - [ ] Changes save to database
- [ ] Search/filter functionality works (if implemented)
- [ ] Pagination works for large lead lists (if implemented)

### Settings Management (`/admin/settings`)
- [ ] Settings load from database on page load
- [ ] Business Info section:
  - [ ] Can update business name
  - [ ] Can update phone number
  - [ ] Can update email address
  - [ ] Can update physical address
- [ ] Business Hours section:
  - [ ] Can update weekday hours
  - [ ] Can update Saturday hours
  - [ ] Can update Sunday hours
- [ ] Email Settings section:
  - [ ] Can update notification email address
  - [ ] Can toggle auto-reply on/off
- [ ] "Save Settings" button updates database
- [ ] Success message displays after saving
- [ ] Changes persist after page refresh
- [ ] Error handling displays appropriate messages

### Gallery Management (`/admin/gallery`)
- [ ] All uploaded photos display in grid
- [ ] "Upload New Photo" button shows upload form
- [ ] Upload form fields:
  - [ ] Title (required)
  - [ ] Description (required)
  - [ ] Category dropdown (collision/painting/dent)
  - [ ] Photo file input (required)
- [ ] Photo upload works:
  - [ ] File upload to server succeeds
  - [ ] Photo saved to database
  - [ ] Photo appears in admin gallery immediately
  - [ ] Photo accessible via public URL
- [ ] Each photo card shows:
  - [ ] Photo image
  - [ ] Title and description
  - [ ] Category badge
  - [ ] Delete button
- [ ] Delete functionality works:
  - [ ] Confirmation dialog appears
  - [ ] Photo removed from database
  - [ ] Photo file deleted from server
  - [ ] Photo removed from gallery display
- [ ] Tips section displays helpful information
- [ ] Error handling for upload failures

---

## 4. Integration Tests

### Lead Submission → Customer Account Flow
1. [ ] Submit lead via /contact form
2. [ ] Verify lead created in database
3. [ ] Verify customer user account created
4. [ ] Verify signup email sent to customer
5. [ ] Click signup link in email
6. [ ] Complete password setup
7. [ ] Verify automatic login after setup
8. [ ] Verify lead visible in customer dashboard

### Admin Lead Management Flow
1. [ ] Login as admin
2. [ ] Navigate to leads page
3. [ ] Find specific lead
4. [ ] Open lead details
5. [ ] Update lead status
6. [ ] Add admin note
7. [ ] Update repair tracking
8. [ ] Verify changes saved
9. [ ] Verify customer can see updates in their dashboard

### Gallery Management Flow
1. [ ] Login as admin
2. [ ] Navigate to gallery management
3. [ ] Upload new photo with details
4. [ ] Verify photo appears in admin gallery
5. [ ] Open public gallery page (logged out)
6. [ ] Verify photo appears in public gallery
7. [ ] Test category filtering
8. [ ] Click photo to open modal
9. [ ] Return to admin, delete photo
10. [ ] Verify photo removed from public gallery

### Authentication Persistence
1. [ ] Login as customer
2. [ ] Close browser completely
3. [ ] Reopen browser and navigate to site
4. [ ] Verify still logged in
5. [ ] Verify can access dashboard without re-login
6. [ ] Repeat test for admin login

---

## 5. Security Tests

### Authentication & Authorization
- [ ] Cannot access /admin/* routes without authentication
- [ ] Cannot access /customer/dashboard without authentication
- [ ] Customer users cannot access admin routes
- [ ] JWT tokens expire appropriately (30 days)
- [ ] Logout properly clears authentication
- [ ] API endpoints properly validate JWT tokens
- [ ] Admin endpoints reject non-admin users

### API Security
- [ ] Rate limiting works on /api/leads endpoint
- [ ] CORS properly configured
- [ ] File upload validates file types
- [ ] File upload size limits enforced
- [ ] SQL/NoSQL injection attempts fail
- [ ] XSS attempts properly sanitized

### Data Validation
- [ ] Email format validation works
- [ ] Phone number format validation works
- [ ] Required fields enforced on forms
- [ ] Password strength requirements enforced
- [ ] Invalid tokens rejected (expired, malformed)

---

## 6. Performance Tests

- [ ] Gallery page loads in under 2 seconds
- [ ] Large image files handled appropriately
- [ ] Dashboard loads quickly with many leads
- [ ] No memory leaks on navigation
- [ ] Images optimized and cached properly

---

## 7. Responsive Design Tests

### Mobile (375px - 767px)
- [ ] Navigation collapses to mobile menu
- [ ] Forms are usable on mobile
- [ ] Gallery grid adjusts to single column
- [ ] Admin tables scroll horizontally if needed
- [ ] Buttons and links are tap-friendly (min 44px)

### Tablet (768px - 1023px)
- [ ] Gallery shows 2 columns
- [ ] Admin sidebar responsive
- [ ] Forms maintain good layout

### Desktop (1024px+)
- [ ] Full navigation displays
- [ ] Gallery shows 3+ columns
- [ ] Admin sidebar fixed on left
- [ ] All features accessible

---

## 8. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 9. Error Handling Tests

- [ ] Network error displays user-friendly message
- [ ] 404 page displays for invalid routes
- [ ] 500 error handled gracefully
- [ ] Failed API calls show error messages
- [ ] Form submission errors display inline
- [ ] File upload errors show specific messages
- [ ] Loading states prevent double-submissions

---

## 10. Email Notification Tests

- [ ] Lead submission triggers notification email
- [ ] Notification email contains correct lead details
- [ ] Notification email includes uploaded photos
- [ ] Customer signup email sent with correct token link
- [ ] Signup link expires after 7 days
- [ ] Email templates are well-formatted

---

## Known Issues / Limitations

- Gallery photos stored locally (not cloud storage)
- No pagination on leads page (may be slow with 1000+ leads)
- Email requires SMTP configuration
- No forgot password functionality yet
- No admin user management interface

---

## Testing Priority

**High Priority (Must Test):**
1. Lead submission and customer account creation
2. Customer login and dashboard
3. Admin login and lead management
4. Gallery upload and public display
5. Authentication persistence

**Medium Priority (Should Test):**
1. Settings management
2. Repair tracking updates
3. Mobile responsiveness
4. Error handling

**Low Priority (Nice to Test):**
1. Browser compatibility
2. Performance under load
3. Edge cases

---

## Test Results Template

```
Test Date: _______________
Tester: ___________________
Environment: Development / Staging / Production

| Test Section | Pass | Fail | Notes |
|-------------|------|------|-------|
| Public Website | [ ] | [ ] | |
| Customer Portal | [ ] | [ ] | |
| Admin Panel | [ ] | [ ] | |
| Integration | [ ] | [ ] | |
| Security | [ ] | [ ] | |
| Performance | [ ] | [ ] | |
| Responsive Design | [ ] | [ ] | |

Critical Issues Found:
1.
2.

Minor Issues Found:
1.
2.

Overall Status: PASS / FAIL / NEEDS WORK
```
