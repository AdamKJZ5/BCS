# 🚗 Vehicle Priority & 📅 Calendar Features

## Overview

New features added to enhance vehicle management and appointment viewing:

1. **Primary & Secondary Vehicle Designation**
2. **Appointments Calendar View**

---

## 🚗 Primary & Secondary Vehicle System

### What's New

Users can now designate vehicles with priorities:
- **⭐ Primary Vehicle** - Your main vehicle (yellow badge)
- **⭐ Secondary Vehicle** - Your backup vehicle (cyan/blue badge)

### How It Works

#### Setting Primary Vehicle

1. Go to **Customer Dashboard** → **My Vehicles** tab
2. Click on any vehicle card
3. Click **"⭐ Set as Primary"** button
4. The vehicle will be marked as primary and displayed at the top

#### Setting Secondary Vehicle

1. Go to **Customer Dashboard** → **My Vehicles** tab
2. Click on any vehicle card (that isn't primary)
3. Click **"⭐ Set as Secondary"** button
4. The vehicle will be marked as secondary

### Rules

- ✅ **Only one primary vehicle** per user
- ✅ **Only one secondary vehicle** per user
- ✅ A vehicle **cannot be both** primary and secondary
- ✅ Setting a vehicle as primary automatically removes secondary status
- ✅ Setting a vehicle as secondary automatically removes primary status
- ✅ First vehicle added is **automatically set as primary**
- ✅ When deleting primary vehicle, next vehicle becomes primary
- ✅ When deleting secondary vehicle, next vehicle becomes secondary

### Benefits

- 📍 **Quick identification** - Easily spot your main vehicles
- 🎯 **Default selections** - Forms can pre-select your primary vehicle
- 📊 **Better organization** - Keep your vehicle list sorted by priority
- 🚙 **Multiple vehicles** - Perfect for households with multiple cars

---

## 📅 Appointments Calendar View

### What's New

Appointments can now be viewed in a beautiful, interactive calendar!

### Features

#### View Modes

Two ways to view your appointments:

1. **📋 List View** (Traditional)
   - Detailed list of upcoming and past appointments
   - Shows all information inline
   - Easy to read on mobile

2. **📅 Calendar View** (NEW!)
   - Month, Week, Day, and Agenda views
   - Color-coded by appointment status
   - Click appointments for details
   - Visual overview of your schedule

#### How to Use

1. Go to **Customer Dashboard** → **My Appointments** tab
2. Click **"📅 Calendar View"** button at the top
3. Use the toolbar to switch between views:
   - **Month** - See the whole month
   - **Week** - See the current week
   - **Day** - See a single day
   - **Agenda** - List of upcoming appointments

4. Click on any appointment to see details

#### Color Coding

Appointments are color-coded by status:

| Status | Color | Meaning |
|--------|-------|---------|
| 📘 **Scheduled** | Blue | Appointment booked |
| ✅ **Confirmed** | Green | Appointment confirmed |
| ⏳ **In Progress** | Yellow | Currently being serviced |
| ✔️ **Completed** | Gray | Service finished |
| ❌ **Cancelled** | Red | Appointment cancelled |

#### Calendar Controls

- **← →** Navigate between months/weeks/days
- **Today** button - Jump back to current date
- **View dropdown** - Switch between Month/Week/Day/Agenda
- **Click appointment** - View details and switch to list view

### Benefits

- 📊 **Visual overview** - See your schedule at a glance
- 🗓️ **Better planning** - Easily spot available times
- 📱 **Multiple views** - Choose the view that works for you
- 🎨 **Color coding** - Quickly identify appointment status
- 🔄 **Easy switching** - Toggle between list and calendar views

---

## 🎯 Usage Examples

### Example 1: Managing Multiple Vehicles

**Scenario:** You have 3 vehicles - a daily driver, a work truck, and a weekend car.

```
1. Set your daily driver as PRIMARY
   → It gets the ⭐ Primary badge
   → Always appears first in the list

2. Set your work truck as SECONDARY
   → It gets the ⭐ Secondary badge
   → Appears second in the list

3. Your weekend car remains unmarked
   → Appears after primary and secondary
```

### Example 2: Using Calendar View

**Scenario:** Planning when to bring your car in for service.

```
1. Go to Appointments tab
2. Click "📅 Calendar View"
3. Switch to "Month" view
4. See all your appointments for the month
5. Find a good time for service
6. Click on an existing appointment to see details
7. Use "Export to Calendar" to add to your personal calendar
```

### Example 3: Switching Vehicle Priority

**Scenario:** You sold your primary vehicle and want to promote your secondary.

```
1. Go to My Vehicles tab
2. Click on your secondary vehicle card
3. Click "⭐ Set as Primary"
4. The vehicle is now marked as Primary
5. Previous primary vehicle is now unmarked
```

---

## 🔧 Technical Details

### Backend Changes

**Vehicle Model (`server/src/models/Vehicle.ts`)**
- Added `isSecondary: boolean` field
- Updated pre-save hooks to ensure only one primary/secondary per user
- Automatic unset of conflicting priorities

**Vehicle Controller (`server/src/controllers/vehicleController.ts`)**
- New `setSecondaryVehicle` function
- Updated delete logic to reassign secondary vehicles

**Vehicle Routes (`server/src/routes/vehicleRoutes.ts`)**
- New endpoint: `POST /api/vehicles/:id/set-secondary`

### Frontend Changes

**API Client (`client/src/api/vehicles.ts`)**
- Added `isSecondary` to Vehicle interface
- New `setSecondaryVehicle()` function

**New Component (`client/src/components/AppointmentsCalendar.tsx`)**
- Full calendar implementation using `react-big-calendar`
- Date localization with `date-fns`
- Color-coded appointment events
- Multiple view modes (Month/Week/Day/Agenda)

**Dashboard Updates (`client/src/pages/customer/Dashboard.tsx`)**
- Added calendar view toggle
- Integrated AppointmentsCalendar component
- Added secondary vehicle badge
- Updated vehicle state management

**Edit Vehicle Modal (`client/src/components/EditVehicleModal.tsx`)**
- Added "Set as Secondary" button
- Updated priority conflict handling
- Cyan/blue styling for secondary

---

## 🎨 UI/UX Improvements

### Vehicle Cards

**Primary Vehicle:**
```
┌─────────────────────────────────┐
│ ⭐ Primary Vehicle    [YELLOW]   │
│                                  │
│ 2024 Toyota Crown                │
│ "poop"                           │
│                                  │
│ Color: Gray                      │
│ License Plate: nja lvnalvnaln    │
│ VIN: dnalanlvnlnvlas             │
│                                  │
│ Click to edit                    │
└─────────────────────────────────┘
```

**Secondary Vehicle:**
```
┌─────────────────────────────────┐
│ ⭐ Secondary Vehicle  [BLUE]     │
│                                  │
│ 2023 Honda Accord                │
│                                  │
│ Color: Black                     │
│ License Plate: ABC1234           │
│                                  │
│ Click to edit                    │
└─────────────────────────────────┘
```

### Calendar View

```
┌─────────────────────────────────────────────────┐
│ [📋 List View] [📅 Calendar View]  [📥 Export]  │
├─────────────────────────────────────────────────┤
│                                                  │
│     February 2026                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Sun Mon Tue Wed Thu Fri Sat                 │ │
│ │  1   2   3   4   5   6   7                  │ │
│ │  8   9  10  11  12  13  14                  │ │
│ │         🔵         ✅                         │ │
│ │ 15  16  17  18  19  20  21                  │ │
│ │ 22  23  24  25  26  27  28                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Legend:                                          │
│ 🔵 Scheduled  ✅ Confirmed  ⏳ In Progress      │
│ ✔️ Completed  ❌ Cancelled                       │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### For Users

1. **Start the application:**
   ```bash
   cd /Users/bloom/Documents/src/chef/BCS
   ./start-both.sh
   ```

2. **Access Customer Dashboard:**
   ```
   http://localhost:5137/customer/dashboard
   ```

3. **Try the new features:**
   - Add or edit vehicles to set priority
   - View appointments in calendar mode
   - Export appointments to your calendar

### For Developers

**Test Vehicle Priority:**
```bash
# The feature is already integrated
# Just add/edit vehicles through the UI
```

**Test Calendar View:**
```bash
# Make sure you have some appointments
# Then toggle between list and calendar views
```

---

## 📊 API Reference

### Set Secondary Vehicle

**Endpoint:** `POST /api/vehicles/:id/set-secondary`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "vehicle_id",
  "make": "Toyota",
  "model": "Crown",
  "year": 2026,
  "isPrimary": false,
  "isSecondary": true,
  ...
}
```

---

## 🐛 Troubleshooting

### Issue: Can't Set Vehicle as Secondary

**Solution:** Make sure the vehicle isn't already primary. A vehicle can't be both.

### Issue: Calendar View Not Showing

**Solution:**
1. Make sure you have appointments
2. Try refreshing the page
3. Check browser console for errors

### Issue: Colors Not Showing in Calendar

**Solution:**
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Check that the appointment has a valid status

---

## 🎉 Summary

You now have:

✅ **Primary & Secondary vehicle designation** - Organize your vehicles by priority
✅ **Full calendar view** - See appointments in Month/Week/Day/Agenda views
✅ **Color-coded statuses** - Quickly identify appointment status
✅ **Easy view switching** - Toggle between list and calendar
✅ **Export functionality** - Add appointments to your personal calendar

Enjoy your enhanced vehicle and appointment management system!
