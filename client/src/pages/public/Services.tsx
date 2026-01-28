import { Link } from "react-router-dom";
import PublicLayout from "../../components/Layout/PublicLayout";
import SEO from "../../components/SEO";

const Services = () => {
  return (
    <PublicLayout>
      <SEO
        title="Auto Body Repair Services - Collision Repair, Painting & More"
        description="Comprehensive auto body services in Bellevue: collision repair, auto painting, dent removal, glass repair, free towing. I-CAR Gold Class Certified. Lifetime warranty."
        keywords="collision repair services, auto painting Bellevue, dent repair, auto body services, frame straightening, glass repair Bellevue, free towing service"
        url="http://www.bellevuecollisionservices.com/services"
      />
      <div style={styles.pageHeader}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Our Services</h1>
          <p style={styles.pageSubtitle}>
            Professional auto body services backed by years of experience
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.servicesSection}>
          {services.map((service) => (
            <div key={service.title} style={styles.serviceCard} className="card-hover">
              <div style={styles.serviceImageContainer}>
                <img
                  src={service.image}
                  alt={service.title}
                  style={styles.serviceImage}
                />
              </div>
              <div style={styles.serviceContent}>
                <h2 style={styles.serviceTitle}>{service.title}</h2>
              <p style={styles.serviceDescription}>{service.description}</p>

              <div style={styles.serviceDetails}>
                <div style={styles.detailItem}>
                  <strong>Turnaround Time:</strong> {service.turnaround}
                </div>
                <div style={styles.detailItem}>
                  <strong>Pricing:</strong> {service.pricing}
                </div>
              </div>

              {service.features && (
                <ul style={styles.featureList}>
                  {service.features.map((feature, idx) => (
                    <li key={idx} style={styles.featureItem}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>Need a Quote?</h2>
          <p style={styles.ctaText}>
            Contact us today to discuss your needs and get a free estimate.
          </p>
          <Link to="/contact" style={styles.ctaButton}>
            Request a Quote
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
};

const services = [
  {
    image: "/assets/images/collision-repair.jpg",
    title: "Collision Repair",
    description:
      "Complete collision repair services to restore your vehicle to its pre-accident condition. We use state-of-the-art equipment and factory-approved repair procedures with I-CAR Gold Class certification.",
    turnaround: "Varies by damage",
    pricing: "Free estimate with insurance support",
    features: [
      "Frame straightening and alignment",
      "Structural damage repair",
      "Panel replacement and repair",
      "Factory-approved procedures",
      "Works with all insurance companies",
    ],
  },
  {
    image: "/assets/images/painting.jpg",
    title: "Auto Painting & Refinishing",
    description:
      "Professional automotive painting with our computerized color matching system to reproduce any factory finish. We ensure perfect color match every time.",
    turnaround: "3-5 business days",
    pricing: "Contact for quote",
    features: [
      "Computerized color matching system",
      "Factory finish reproduction",
      "Full vehicle painting",
      "Spot painting and blending",
      "Lifetime warranty on craftsmanship",
    ],
  },
  {
    image: "/assets/images/body-repair.jpg",
    title: "Auto Body Repair",
    description:
      "Expert auto body repair for dents, scratches, and damage of all kinds. Our skilled technicians restore your vehicle to like-new condition.",
    turnaround: "1-5 business days",
    pricing: "Free estimate available",
    features: [
      "Dent repair and removal",
      "Scratch repair",
      "Bumper repair and replacement",
      "Panel straightening",
      "Quality craftsmanship guaranteed",
    ],
  },
  {
    image: "/assets/images/general-service.jpg",
    title: "Glass Repair & Replacement",
    description:
      "Professional auto glass services including windshield repair and replacement. We handle all glass work with precision and care.",
    turnaround: "Same day service available",
    pricing: "Often covered by insurance",
    features: [
      "Windshield repair and replacement",
      "Side window replacement",
      "Back glass replacement",
      "Insurance billing assistance",
      "Quality glass materials",
    ],
  },
  {
    image: "/assets/images/collision-repair.jpg",
    title: "Towing Services",
    description:
      "Free towing service to our facility. We'll pick up your damaged vehicle and bring it to our shop for repair.",
    turnaround: "Available 24/7",
    pricing: "FREE TOWING",
    features: [
      "24-hour emergency service",
      "Free towing to our facility",
      "Quick response time",
      "Safe vehicle transport",
      "No hidden fees",
    ],
  },
  {
    image: "/assets/images/contact-icon.jpg",
    title: "Rental Car Assistance",
    description:
      "We help coordinate rental car services while your vehicle is being repaired. We work to make the process as convenient as possible.",
    turnaround: "Immediate assistance",
    pricing: "Insurance coordination available",
    features: [
      "Rental car coordination",
      "Insurance billing assistance",
      "Multiple rental options",
      "Delivery to our facility",
      "Seamless transition",
    ],
  },
];

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
  servicesSection: {
    padding: "4rem 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "2.5rem",
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
  },
  serviceImageContainer: {
    width: "100%",
    height: "320px",
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative" as const,
  },
  serviceImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
    imageRendering: "crisp-edges" as const,
  },
  serviceContent: {
    padding: "1.5rem",
  },
  serviceTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 0 0.75rem 0",
    color: "#0047AB",
  },
  serviceDescription: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#333",
    marginBottom: "1rem",
  },
  serviceDetails: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    flexWrap: "wrap" as const,
    borderLeft: "3px solid #FFD700",
  },
  detailItem: {
    fontSize: "0.875rem",
    color: "#555",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  featureItem: {
    fontSize: "0.875rem",
    color: "#555",
    padding: "0.25rem 0",
  },
  ctaSection: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    margin: "2rem 0 4rem",
  },
  ctaTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  ctaText: {
    fontSize: "1.1rem",
    color: "#666",
    marginBottom: "2rem",
  },
  ctaButton: {
    display: "inline-block",
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "1rem 2rem",
    borderRadius: "4px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    transition: "background-color 0.3s",
  },
};

export default Services;
