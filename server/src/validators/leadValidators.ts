export function validateLead(data: any): string | null {
  const { name, email, phone, message, company } = data;

  // Honeypot check
  if (typeof company === "string" && company.trim() !== "") {
    return SPAM_ERROR;
  }

  if (!name || name.trim().length < 2) {
    return "Name is required";
  }

  if (!email || !email.includes("@")) {
    return "Valid email required";
  }

  if (!phone || phone.trim().length < 7) {
    return "Phone number required";
  }

  if (!message || message.trim().length < 10) {
    return "Message too short";
  }

  return null;
}
