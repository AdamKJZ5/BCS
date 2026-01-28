import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.section}>
          <h3 style={styles.heading}>Bellevue Collision Services</h3>
          <p style={styles.text}>
            Over 30 years of experience providing quality auto body repair and collision services in Bellevue, WA.
          </p>
        </div>

        <div style={styles.section}>
          <h4 style={styles.subheading}>Quick Links</h4>
          <div style={styles.links}>
            <Link to="/services" style={styles.link}>Services</Link>
            <Link to="/gallery" style={styles.link}>Gallery</Link>
            <Link to="/about" style={styles.link}>About Us</Link>
            <Link to="/contact" style={styles.link}>Contact</Link>
          </div>
        </div>

        <div style={styles.section}>
          <h4 style={styles.subheading}>Contact Info</h4>
          <p style={styles.text}>Phone: (425) 373-0308</p>
          <p style={styles.text}>Fax: (425) 373-0310</p>
          <p style={styles.text}>Address: 13434 SE 27th Pl, Bellevue WA 98005</p>
        </div>

        <div style={styles.section}>
          <h4 style={styles.subheading}>Business Hours</h4>
          <p style={styles.text}>Monday - Friday: 8:00 AM - 5:30 PM</p>
          <p style={styles.text}>Saturday: By Appointment Only</p>
          <p style={styles.text}>Sunday: Closed</p>
        </div>
      </div>

      <div style={styles.bottom}>
        <div style={styles.container}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Bellevue Collision Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#0047AB",
    color: "#fff",
    marginTop: "4rem",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "3rem 2rem 2rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
  },
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
  },
  subheading: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
  },
  text: {
    margin: "0.25rem 0",
    fontSize: "0.9rem",
    color: "#ccc",
  },
  links: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  link: {
    color: "#ccc",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.3s, transform 0.2s",
    display: "inline-block",
  },
  bottom: {
    borderTop: "1px solid #333",
    padding: "1.5rem 0",
  },
  copyright: {
    textAlign: "center" as const,
    margin: 0,
    color: "#888",
    fontSize: "0.9rem",
  },
};

export default Footer;
