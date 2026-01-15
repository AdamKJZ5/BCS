
export function validateLead(data: any) {
  const { name, email, phone, message } = data;

  if (!name || name.length < 2) return "Name is required";
  if (!email || !email.includes("@")) return "Valid email required";
  if (!phone || phone.length < 7) return "Phone number required";
  if (!message || message.length < 10) return "Message too short";

  return null;
}
