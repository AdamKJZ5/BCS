/**
 * Appointment Controllers Index
 * Re-exports all appointment controller functions from modular files
 */

// Availability
export { getAvailability } from './appointmentAvailabilityController';

// Customer operations
export {
  createAppointment,
  getMyAppointments,
  updateAppointment,
  cancelAppointment,
} from './appointmentCustomerController';

// Admin operations
export {
  getAllAppointments,
  getCalendarView,
  getAppointmentsByEmployee,
  createAdminAppointment,
  assignAppointment,
  updateAppointmentStatus,
  getAppointmentStats,
} from './appointmentAdminController';

// Invoice operations
export { createInvoiceFromAppointment } from './appointmentInvoiceController';

// Photo operations
export {
  uploadAppointmentPhotos,
  deleteAppointmentPhoto,
} from './appointmentPhotoController';

// Export operations
export {
  exportAppointmentICalendSingle,
  exportMyAppointmentsICal,
  exportAllAppointmentsICal,
} from './appointmentExportController';
