/**
 * Validators Index
 * Central export for all validation middleware
 */

// Validation handler
export { handleValidationErrors, validate } from './validationHandler';

// Appointment validators
export {
  validateCreateAppointment,
  validateUpdateAppointmentStatus,
  validateAssignAppointment,
  validateCancelAppointment,
  validateGetAvailability,
  validateCreateInvoiceFromAppointment,
  validatePhotoUpload,
  validateDeletePhoto,
} from './appointmentValidators';

// Auth validators
export {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCompleteSignup,
  validateChangePassword,
  validateUpdateProfile,
} from './authValidators';

// Invoice validators
export {
  validateCreateInvoice,
  validateUpdateInvoiceStatus,
  validateRecordPayment,
  validateGetInvoices,
  validateInvoiceId,
} from './invoiceValidators';

// Vehicle validators
export {
  validateCreateVehicle,
  validateUpdateVehicle,
  validateVehicleId,
} from './vehicleValidators';
