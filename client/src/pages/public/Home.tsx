import { Link } from "react-router-dom";
import PublicLayout from "../../components/Layout/PublicLayout";
import SEO from "../../components/SEO";

const Home = () => {
  return (
    <PublicLayout>
      <SEO
        title="Bellevue Collision Services - Auto Body Repair & Collision Repair in Bellevue WA"
        description="Over 30 years of expert auto body repair, collision repair, and painting services in Bellevue, WA. I-CAR Gold Class Certified. Lifetime warranty. Free towing. Call (425) 373-0308"
        keywords="auto body repair Bellevue, collision repair Bellevue WA, car paint Bellevue, auto body shop Bellevue, I-CAR certified, Bellevue auto repair, car repair Bellevue"
        url="http://www.bellevuecollisionservices.com"
        type="website"
      />
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Bellevue's Trusted Collision Repair Experts</h1>
          <p style={styles.heroSubtitle}>
            Over 30 years of experience • Lifetime Warranty • I-CAR Gold Class Certified
          </p>
          <div style={styles.heroButtons}>
            <Link to="/contact" style={styles.primaryButton}>
              Book Now / Get a Quote
            </Link>
            <Link to="/services" style={styles.secondaryButton}>
              View Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Our Services</h2>
          <div style={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.title} style={styles.serviceCard} className="card-hover">
                <div style={styles.serviceImageContainer}>
                  <img
                    src={service.image}
                    alt={service.title}
                    style={styles.serviceImage}
                  />
                </div>
                <h3 style={styles.serviceTitle}>{service.title}</h3>
                <p style={styles.serviceDescription}>{service.description}</p>
              </div>
            ))}
          </div>
          <div style={styles.centerButton}>
            <Link to="/services" style={styles.link}>
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={styles.whySection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Choose Us</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature) => (
              <div key={feature.title} style={styles.feature}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureText}>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to Restore Your Vehicle?</h2>
          <p style={styles.ctaText}>
            Contact us today for a free estimate and see why our customers trust
            us with their vehicles.
          </p>
          <Link to="/contact" style={styles.ctaButton}>
            Get Started
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

const services = [
  {
    image: "/assets/images/collision-repair.jpg",
    title: "Collision Repair",
    description: "Expert collision repair to restore your vehicle to pre-accident condition",
  },
  {
    image: "/assets/images/painting.jpg",
    title: "Auto Painting",
    description: "Professional painting services with color-match guarantee",
  },
  {
    image: "/assets/images/body-repair.jpg",
    title: "Auto Body Repair",
    description: "Quick and quality body repair without compromising excellence",
  },
  {
    image: "/assets/images/general-service.jpg",
    title: "Full Service",
    description: "Comprehensive auto body services with lifetime warranty",
  },
];

const features = [
  {
    icon: "✓",
    title: "Over 30 Years Experience",
    text: "Three decades of expertise in collision repair and auto body services",
  },
  {
    icon: "✓",
    title: "Lifetime Warranty",
    text: "100% lifetime warranty on all craftsmanship",
  },
  {
    icon: "✓",
    title: "I-CAR Gold Class Certified",
    text: "Certified staff trained to meet latest factory repair standards",
  },
  {
    icon: "✓",
    title: "Free Towing & 24/7 Service",
    text: "24-hour emergency service with free towing and rental car assistance",
  },
];

const styles = {
  hero: {
    background: "linear-gradient(135deg, #0047AB 0%, #0066CC 100%)",
    color: "#fff",
    padding: "6rem 2rem",
    textAlign: "center" as const,
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: "bold",
    margin: "0 0 1rem",
  },
  heroSubtitle: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    opacity: 0.9,
  },
  heroButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  primaryButton: {
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "1rem 2rem",
    borderRadius: "4px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    transition: "transform 0.3s",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: "#fff",
    padding: "1rem 2rem",
    borderRadius: "4px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    border: "2px solid #fff",
    transition: "all 0.3s",
  },
  section: {
    padding: "4rem 2rem",
  },
  whySection: {
    padding: "4rem 2rem",
    backgroundColor: "#f8f9fa",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "3rem",
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
    marginBottom: "2rem",
  },
  serviceCard: {
    backgroundColor: "#fff",
    padding: "0",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
    overflow: "hidden",
  },
  serviceImageContainer: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  serviceTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "1.5rem 1rem 1rem",
  },
  serviceDescription: {
    color: "#666",
    lineHeight: "1.6",
    padding: "0 1.5rem 1.5rem",
  },
  centerButton: {
    textAlign: "center" as const,
    marginTop: "2rem",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "bold",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
  },
  feature: {
    textAlign: "center" as const,
  },
  featureIcon: {
    fontSize: "2.5rem",
    color: "#0047AB",
    marginBottom: "1rem",
  },
  featureTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  featureText: {
    color: "#666",
    lineHeight: "1.6",
  },
  ctaSection: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: "4rem 2rem",
    textAlign: "center" as const,
  },
  ctaTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  ctaText: {
    fontSize: "1.25rem",
    marginBottom: "2rem",
    opacity: 0.9,
  },
  ctaButton: {
    display: "inline-block",
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "1rem 2.5rem",
    borderRadius: "4px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    transition: "background-color 0.3s",
  },
};

export default Home;
