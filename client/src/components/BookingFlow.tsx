import { useState, FormEvent } from "react";
import DatePicker from "./DatePicker";
import TimeSlotSelector from "./TimeSlotSelector";
import { TimeSlot } from "../api/appointments";

export interface BookingService {
  id: string;
  name: string;
  icon: string;
  duration: number;
  description: string;
}

export interface BookingLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Props {
  accent: string;
  brand: string;
  locations: BookingLocation[];
  services?: BookingService[];
  apiBase?: string;
}

const DEFAULT_SERVICES: BookingService[] = [
  { id: "estimate",   name: "Free Damage Estimate",    icon: "🔍", duration: 30, description: "Walkthrough of your vehicle's damage with a written estimate." },
  { id: "collision",  name: "Collision Repair",        icon: "🚗", duration: 30, description: "Schedule drop-off for collision repair work." },
  { id: "paint",      name: "Auto Body & Paint Quote", icon: "🎨", duration: 30, description: "Get a quote for full-panel paint or body work." },
  { id: "dent",       name: "Dent / Scratch Repair",   icon: "🔧", duration: 30, description: "Small dents, scratches, and bumper scuffs." },
  { id: "glass",      name: "Glass Repair Quote",      icon: "🪟", duration: 30, description: "Windshield and side-glass repair quotes." },
  { id: "insurance",  name: "Insurance Claim Consult", icon: "📋", duration: 30, description: "Help filing or processing an insurance claim." },
];

const BookingFlow = ({ accent, locations, services = DEFAULT_SERVICES, apiBase }: Props) => {
  const hasMultipleLocations = locations.length > 1;
  const totalSteps = hasMultipleLocations ? 5 : 4;

  const [step, setStep] = useState(1);
  const [service, setService] = useState<BookingService | null>(null);
  const [location, setLocation] = useState<BookingLocation | null>(hasMultipleLocations ? null : locations[0]);
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const accentSoft = accent + "1a";

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps + 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const stepNum = (label: string) => {
    if (label === "service") return 1;
    if (label === "location") return hasMultipleLocations ? 2 : -1;
    if (label === "date") return hasMultipleLocations ? 3 : 2;
    if (label === "time") return hasMultipleLocations ? 4 : 3;
    if (label === "details") return hasMultipleLocations ? 5 : 4;
    return 999;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!service || !slot || !location) return;
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", details.name);
      fd.append("email", details.email);
      fd.append("phone", details.phone);
      const vehicle = [details.vehicleYear, details.vehicleMake, details.vehicleModel].filter(Boolean).join(" ");
      fd.append("message", `Booking: ${service.name} at ${location.name}${vehicle ? ` — Vehicle: ${vehicle}` : ""}${details.notes ? `\n\nNotes: ${details.notes}` : ""}`);
      fd.append("damageDescription", details.notes || `${service.name} requested at ${location.name}`);
      fd.append("wantAppointment", "true");
      fd.append("appointmentType", service.id === "estimate" ? "estimate" : service.id === "collision" ? "drop_off" : "consultation");
      fd.append("appointmentStartTime", slot.startTime);

      const base = apiBase || (import.meta as any).env?.VITE_API_BASE_URL || "";
      const res = await fetch(`${base}/api/leads`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={s.card}>
        <div style={{ ...s.successBadge, backgroundColor: accentSoft, color: accent }}>✓</div>
        <h3 style={s.successTitle}>Appointment booked!</h3>
        <p style={s.successText}>
          Thanks {details.name.split(" ")[0]}. We've sent a confirmation to <strong>{details.email}</strong>.
        </p>
        <div style={s.summary}>
          <div><strong>Service:</strong> {service?.name}</div>
          <div><strong>Location:</strong> {location?.name} — {location?.address}</div>
          <div><strong>When:</strong> {slot && new Date(slot.startTime).toLocaleString([], { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
        </div>
        <button
          onClick={() => { setSuccess(false); setStep(1); setService(null); setSlot(null); setDate(null); }}
          style={{ ...s.secondaryBtn, borderColor: accent, color: accent }}
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <Stepper accent={accent} current={step} total={totalSteps} />

      {step === stepNum("service") && (
        <div>
          <h3 style={s.stepTitle}>What would you like to book?</h3>
          <p style={s.stepHelp}>Select the service you need today.</p>
          <div style={s.serviceGrid}>
            {services.map((sv) => {
              const selected = service?.id === sv.id;
              return (
                <button
                  key={sv.id}
                  onClick={() => { setService(sv); }}
                  style={{
                    ...s.serviceCard,
                    borderColor: selected ? accent : "#e5e7eb",
                    boxShadow: selected ? `0 0 0 3px ${accentSoft}` : "none",
                  }}
                >
                  <div style={{ ...s.serviceIcon, color: accent }}>{sv.icon}</div>
                  <div style={s.serviceName}>{sv.name}</div>
                  <div style={s.serviceMeta}>{sv.duration} min</div>
                  <div style={s.serviceDesc}>{sv.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasMultipleLocations && step === stepNum("location") && (
        <div>
          <h3 style={s.stepTitle}>Which location?</h3>
          <p style={s.stepHelp}>Pick the shop closest to you.</p>
          <div style={s.locGrid}>
            {locations.map((loc) => {
              const selected = location?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setLocation(loc)}
                  style={{
                    ...s.locCard,
                    borderColor: selected ? accent : "#e5e7eb",
                    boxShadow: selected ? `0 0 0 3px ${accentSoft}` : "none",
                  }}
                >
                  <div style={{ ...s.locName, color: accent }}>{loc.name}</div>
                  <div style={s.locAddr}>{loc.address}</div>
                  <div style={s.locPhone}>{loc.phone}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === stepNum("date") && (
        <div>
          <h3 style={s.stepTitle}>Pick a date</h3>
          <p style={s.stepHelp}>{location && <>at <strong>{location.name}</strong> — {service?.name}</>}</p>
          <DatePicker selectedDate={date} onChange={(d: Date) => setDate(d)} />
        </div>
      )}

      {step === stepNum("time") && date && service && (
        <div>
          <h3 style={s.stepTitle}>Pick a time</h3>
          <p style={s.stepHelp}>{date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
          <TimeSlotSelector
            date={date}
            duration={service.duration}
            onSelectSlot={(slot: TimeSlot) => setSlot(slot)}
            selectedSlot={slot}
          />
        </div>
      )}

      {step === stepNum("details") && (
        <form onSubmit={submit}>
          <h3 style={s.stepTitle}>Your details</h3>
          <p style={s.stepHelp}>So we know who's coming in.</p>
          <div style={s.row2}>
            <Field label="Name *" value={details.name} onChange={(v) => setDetails({ ...details, name: v })} required accent={accent} />
            <Field label="Phone *" value={details.phone} onChange={(v) => setDetails({ ...details, phone: v })} required accent={accent} />
          </div>
          <Field label="Email *" type="email" value={details.email} onChange={(v) => setDetails({ ...details, email: v })} required accent={accent} />
          <div style={s.row3}>
            <Field label="Vehicle year" value={details.vehicleYear} onChange={(v) => setDetails({ ...details, vehicleYear: v })} accent={accent} />
            <Field label="Make" value={details.vehicleMake} onChange={(v) => setDetails({ ...details, vehicleMake: v })} accent={accent} />
            <Field label="Model" value={details.vehicleModel} onChange={(v) => setDetails({ ...details, vehicleModel: v })} accent={accent} />
          </div>
          <Field label="Notes (optional)" value={details.notes} onChange={(v) => setDetails({ ...details, notes: v })} accent={accent} textarea />

          <div style={s.summary}>
            <div style={s.summaryTitle}>Booking summary</div>
            <div><strong>{service?.name}</strong> · {service?.duration} min</div>
            <div>{location?.name} — {location?.address}</div>
            <div>{slot && new Date(slot.startTime).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <div style={s.nav}>
            <button type="button" onClick={goBack} style={s.secondaryBtn}>Back</button>
            <button type="submit" disabled={submitting} style={{ ...s.primaryBtn, backgroundColor: accent }}>
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
          </div>
        </form>
      )}

      {step !== stepNum("details") && (
        <div style={s.nav}>
          <button onClick={goBack} disabled={step === 1} style={s.secondaryBtn}>Back</button>
          <button
            onClick={goNext}
            disabled={
              (step === stepNum("service") && !service) ||
              (hasMultipleLocations && step === stepNum("location") && !location) ||
              (step === stepNum("date") && !date) ||
              (step === stepNum("time") && !slot)
            }
            style={{ ...s.primaryBtn, backgroundColor: accent }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

const Stepper = ({ accent, current, total }: { accent: string; current: number; total: number }) => (
  <div style={s.stepper}>
    {Array.from({ length: total }).map((_, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <div key={n} style={s.stepWrap}>
          <div style={{
            ...s.stepDot,
            backgroundColor: done ? accent : active ? "#fff" : "#f3f4f6",
            color: done ? "#fff" : active ? accent : "#9ca3af",
            border: active ? `2px solid ${accent}` : "2px solid #e5e7eb",
          }}>
            {done ? "✓" : n}
          </div>
          {n < total && <div style={{ ...s.stepLine, backgroundColor: done ? accent : "#e5e7eb" }} />}
        </div>
      );
    })}
  </div>
);

const Field = ({ label, value, onChange, required, type = "text", textarea }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; accent?: string; type?: string; textarea?: boolean;
}) => (
  <div style={s.field}>
    <label style={s.label}>{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...s.input, resize: "vertical" }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={s.input}
      />
    )}
  </div>
);

const s: { [key: string]: React.CSSProperties } = {
  wrapper: { background: "#fff", borderRadius: 12, padding: "2rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  card: { background: "#fff", borderRadius: 12, padding: "2.5rem", textAlign: "center", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  stepper: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", gap: 0 },
  stepWrap: { display: "flex", alignItems: "center", flex: "0 1 auto" },
  stepDot: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s" },
  stepLine: { width: 48, height: 2, transition: "background 0.2s" },
  stepTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "0.25rem" },
  stepHelp: { color: "#6b7280", marginBottom: "1.5rem" },
  serviceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  serviceCard: { background: "#fff", border: "2px solid #e5e7eb", borderRadius: 10, padding: "1.25rem", textAlign: "left", cursor: "pointer", transition: "all 0.15s", font: "inherit" },
  serviceIcon: { fontSize: "1.75rem", marginBottom: "0.5rem" },
  serviceName: { fontSize: "1rem", fontWeight: 600, color: "#111", marginBottom: "0.25rem" },
  serviceMeta: { fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.5rem" },
  serviceDesc: { fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.4 },
  locGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  locCard: { background: "#fff", border: "2px solid #e5e7eb", borderRadius: 10, padding: "1.25rem", textAlign: "left", cursor: "pointer", transition: "all 0.15s", font: "inherit" },
  locName: { fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.35rem" },
  locAddr: { fontSize: "0.9rem", color: "#374151", marginBottom: "0.25rem" },
  locPhone: { fontSize: "0.85rem", color: "#6b7280" },
  field: { marginBottom: "1rem" },
  label: { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" },
  input: { width: "100%", padding: "0.65rem 0.75rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.95rem", fontFamily: "inherit", color: "#111" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  row3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" },
  summary: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", margin: "1.25rem 0", fontSize: "0.9rem", color: "#374151", lineHeight: 1.6 },
  summaryTitle: { fontWeight: 700, color: "#111", marginBottom: "0.5rem" },
  nav: { display: "flex", justifyContent: "space-between", marginTop: "1.5rem", gap: "1rem" },
  primaryBtn: { color: "#fff", padding: "0.7rem 1.6rem", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", transition: "transform 0.12s, box-shadow 0.15s" },
  secondaryBtn: { background: "#fff", color: "#374151", padding: "0.7rem 1.6rem", borderRadius: 8, border: "1px solid #d1d5db", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.15s" },
  successBadge: { width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "2rem", fontWeight: 700 },
  successTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "0.5rem" },
  successText: { color: "#4b5563", marginBottom: "1.5rem" },
  error: { background: "#fef2f2", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: 6, fontSize: "0.9rem", marginTop: "1rem", border: "1px solid #fecaca" },
};

export default BookingFlow;
