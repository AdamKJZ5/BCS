import { useState, FormEvent, useEffect } from "react";
import PublicLayout from "../../components/Layout/PublicLayout";
import SEO from "../../components/SEO";
import DatePicker from "../../components/DatePicker";
import TimeSlotSelector from "../../components/TimeSlotSelector";
import { TimeSlot } from "../../api/appointments";
import { useAuth } from "../../context/AuthContext";

const Contact = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    damageDescription: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Appointment booking state
  const [wantAppointment, setWantAppointment] = useState(false);
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);

  // Pre-populate form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }

    // Load preferred appointment type from localStorage
    const savedAppointmentType = localStorage.getItem("preferredAppointmentType");
    if (savedAppointmentType) {
      setAppointmentType(savedAppointmentType);
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setPhotos(files);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate appointment if requested
    if (wantAppointment) {
      if (!appointmentType) {
        setError("Please select an appointment type");
        setLoading(false);
        return;
      }
      if (!appointmentDate || !selectedTimeSlot) {
        setError("Please select a date and time for your appointment");
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("message", formData.message);
      if (formData.damageDescription) {
        formDataToSend.append("damageDescription", formData.damageDescription);
      }

      // Add appointment data if requested
      if (wantAppointment && appointmentType && selectedTimeSlot) {
        formDataToSend.append("wantAppointment", "true");
        formDataToSend.append("appointmentType", appointmentType);
        formDataToSend.append("appointmentStartTime", selectedTimeSlot.startTime);
      }

      photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/leads`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSuccess(true);
      setAppointmentConfirmed(wantAppointment);

      // Save preferred appointment type for next time
      if (wantAppointment && appointmentType) {
        localStorage.setItem("preferredAppointmentType", appointmentType);
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        damageDescription: "",
      });
      setPhotos([]);
      setWantAppointment(false);
      setAppointmentType("");
      setAppointmentDate(null);
      setSelectedTimeSlot(null);
    } catch (err) {
      setError("Failed to submit form. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicLayout>
        <div style={styles.container}>
          <div style={styles.successMessage}>
            <h2 style={styles.successTitle}>Thank You!</h2>
            <p style={styles.successText}>
              Your quote request has been submitted successfully. We'll get back
              to you within 24 hours.
            </p>
            {appointmentConfirmed && (
              <div style={styles.appointmentSuccess}>
                <h3 style={styles.appointmentSuccessTitle}>Appointment Scheduled!</h3>
                <p style={styles.appointmentSuccessText}>
                  Your appointment has been confirmed. You will receive an email with
                  all the details including what to bring and how to prepare.
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setSuccess(false);
                setAppointmentConfirmed(false);
              }}
              style={styles.backButton}
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEO
        title="Contact Us - Get a Free Quote"
        description="Contact Bellevue Collision Services for a free estimate. Located at 13434 SE 27th Pl, Bellevue WA 98005. Call (425) 373-0308. Open Mon-Fri 8AM-5:30PM."
        keywords="auto body quote Bellevue, free estimate collision repair, contact Bellevue collision, auto repair quote, Bellevue WA 98005"
        url="http://www.bellevuecollisionservices.com/contact"
      />
      <div style={styles.pageHeader}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Contact Us</h1>
          <p style={styles.pageSubtitle}>
            Get a free quote or ask us any questions
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Request a Quote</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="name" style={styles.label}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="phone" style={styles.label}>
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="message" style={styles.label}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  style={{ ...styles.input, resize: "vertical" as const }}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="damageDescription" style={styles.label}>
                  Damage Description (Optional)
                </label>
                <textarea
                  id="damageDescription"
                  name="damageDescription"
                  value={formData.damageDescription}
                  onChange={handleInputChange}
                  rows={3}
                  style={{ ...styles.input, resize: "vertical" as const }}
                  placeholder="Describe the damage to your vehicle..."
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="photos" style={styles.label}>
                  Upload Photos (Optional, max 3)
                </label>
                <input
                  type="file"
                  id="photos"
                  name="photos"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />
                {photos.length > 0 && (
                  <div style={styles.fileInfo}>
                    {photos.length} file(s) selected
                  </div>
                )}
              </div>

              {/* Appointment Booking Section */}
              <div style={styles.appointmentSection}>
                <div style={styles.appointmentHeader}>
                  <h3 style={styles.appointmentTitle}>Schedule an Appointment</h3>
                  {isAuthenticated && user && (
                    <div style={styles.authenticatedBanner}>
                      ✓ Booking as <strong>{user.name}</strong>
                    </div>
                  )}
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={wantAppointment}
                      onChange={(e) => {
                        setWantAppointment(e.target.checked);
                        if (!e.target.checked) {
                          setAppointmentType("");
                          setAppointmentDate(null);
                          setSelectedTimeSlot(null);
                        }
                      }}
                      style={styles.checkbox}
                    />
                    Yes, I'd like to schedule an appointment (Optional)
                  </label>
                </div>

                {wantAppointment && (
                  <div style={styles.appointmentFields}>
                    <div style={styles.formGroup}>
                      <label htmlFor="appointmentType" style={styles.label}>
                        Appointment Type *
                      </label>
                      <select
                        id="appointmentType"
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        required={wantAppointment}
                        style={styles.input}
                      >
                        <option value="">Select appointment type</option>
                        <option value="drop_off">Drop Off Vehicle</option>
                        <option value="estimate">Get Estimate</option>
                        <option value="consultation">Consultation</option>
                        <option value="inspection">Vehicle Inspection</option>
                        <option value="pickup">Pick Up Vehicle</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Select Date *</label>
                      <DatePicker
                        selectedDate={appointmentDate}
                        onChange={(date) => {
                          setAppointmentDate(date);
                          setSelectedTimeSlot(null); // Reset time slot when date changes
                        }}
                        minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
                        maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days
                      />
                    </div>

                    {appointmentDate && (
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Select Time *</label>
                        <TimeSlotSelector
                          date={appointmentDate}
                          duration={60}
                          onSelectSlot={setSelectedTimeSlot}
                          selectedSlot={selectedTimeSlot}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && <div style={styles.errorMessage}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.disabledButton : {}),
                }}
              >
                {loading ? (
                  <span>
                    <span style={styles.spinner} />
                    {wantAppointment ? "Submitting & Booking..." : "Submitting..."}
                  </span>
                ) : (
                  wantAppointment ? "Submit & Book Appointment" : "Submit Request"
                )}
              </button>
            </form>
          </div>

          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Contact Information</h3>
              <div style={styles.infoItem}>
                <strong>Phone:</strong> (425) 373-0308
              </div>
              <div style={styles.infoItem}>
                <strong>Fax:</strong> (425) 373-0310
              </div>
              <div style={styles.infoItem}>
                <strong>Address:</strong> 13434 SE 27th Pl, Bellevue WA 98005
              </div>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Business Hours</h3>
              <div style={styles.infoItem}>Monday - Friday: 8:00 AM - 5:30 PM</div>
              <div style={styles.infoItem}>Saturday: By Appointment Only</div>
              <div style={styles.infoItem}>Sunday: Closed</div>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>What to Expect</h3>
              <ul style={styles.expectList}>
                <li>Response within 24 hours</li>
                <li>Free detailed estimate</li>
                <li>Free towing service</li>
                <li>Lifetime warranty on craftsmanship</li>
                <li>Works with all insurance companies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

const styles = {
  pageHeader: {
    background: "linear-gradient(135deg, #0047AB 0%, #0066CC 100%)",
    color: "#fff",
    padding: "4rem 2rem",
    textAlign: "center" as const,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  pageTitle: {
    fontSize: "3rem",
    fontWeight: "bold",
    margin: "0 0 1rem",
  },
  pageSubtitle: {
    fontSize: "1.25rem",
    opacity: 0.9,
    margin: 0,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "3rem",
    padding: "4rem 0",
  },
  formSection: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  fileInput: {
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  fileInfo: {
    fontSize: "0.9rem",
    color: "#666",
    marginTop: "0.5rem",
  },
  submitButton: {
    backgroundColor: "#0047AB",
    color: "#fff",
    padding: "1rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  errorMessage: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
  },
  successMessage: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
  },
  successTitle: {
    fontSize: "2.5rem",
    color: "#28a745",
    marginBottom: "1rem",
  },
  successText: {
    fontSize: "1.25rem",
    color: "#666",
    marginBottom: "2rem",
  },
  backButton: {
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "1rem 2rem",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  infoTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  infoItem: {
    padding: "0.5rem 0",
    color: "#555",
    borderBottom: "1px solid #eee",
  },
  expectList: {
    margin: 0,
    paddingLeft: "1.5rem",
    color: "#555",
  },
  appointmentSection: {
    padding: "1.5rem",
    backgroundColor: "#f9f9f9",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    marginTop: "1rem",
  },
  appointmentHeader: {
    marginBottom: "1rem",
  },
  appointmentTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "0.75rem",
    color: "#0047AB",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  appointmentFields: {
    marginTop: "1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  appointmentSuccess: {
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "8px",
    padding: "1.5rem",
    marginTop: "1.5rem",
  },
  appointmentSuccessTitle: {
    fontSize: "1.5rem",
    color: "#155724",
    marginBottom: "0.5rem",
  },
  appointmentSuccessText: {
    fontSize: "1rem",
    color: "#155724",
    margin: 0,
  },
  authenticatedBanner: {
    padding: "0.75rem 1rem",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "4px",
    color: "#155724",
    fontSize: "0.95rem",
    marginBottom: "0.75rem",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #fff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginRight: "8px",
    verticalAlign: "middle",
  },
};

export default Contact;
