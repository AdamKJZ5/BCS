import PublicLayout from "../../components/Layout/PublicLayout";
import SEO from "../../components/SEO";

const About = () => {
  return (
    <PublicLayout>
      <SEO
        title="About Us - 30+ Years of Auto Body Repair Excellence"
        description="Bellevue Collision Services: Over 30 years of expert auto body repair in Bellevue, WA. I-CAR Gold Class Certified technicians. State-of-the-art facility. Lifetime warranty."
        keywords="about Bellevue Collision, I-CAR Gold Class, certified technicians Bellevue, auto body shop history, experienced collision repair"
        url="http://www.bellevuecollisionservices.com/about"
      />
      <div style={styles.pageHeader}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>About Us</h1>
          <p style={styles.pageSubtitle}>
            Over 30 years of trusted collision repair service in Bellevue, WA
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Story</h2>
          <div style={styles.storyGrid}>
            <div style={styles.storyContent}>
              <p style={styles.paragraph}>
                State-of-the-art equipment and technology can't stand alone. That's why our team is made up of the most knowledgeably trained crew in the area; a crew that has been trained by world recognizable institutions in all aspects of automotive collision and mechanical repair. As for training, it never ends for our crew. Our team maintains a continuous training program to stay ahead of new innovations in the automotive repair industry. We know this training is a necessity so that we can give you the quality service that you demand from a leader like us.
              </p>
              <p style={styles.paragraph}>
                Working families today are very dependent on their vehicles. Customers expect fast, reliable and professional service. We continuously provide such services, and know our customers need their vehicles returned as quickly as possible. Our facility was specifically designed to allow orchestrated vehicle repair scheduling.
              </p>
              <p style={styles.paragraph}>
                We also know that trust is a concern for customers. We have addressed this concern by hiring only highly motivated personnel who share in our personal commitment of customer trust and satisfaction. Our team at Bellevue Collision Services realizes that the customer is the person they work for, and this team is dedicated to providing reliable service as well as protecting the personal rights of our customers. Customers can be assured that their personal belongings will remain safe and secure while their vehicle is undergoing repairs.
              </p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Mission</h2>
          <div style={styles.missionBox}>
            <p style={styles.missionText}>
              When you have to be inconvenienced with automobile repairs, bring your vehicle to a place that makes you feel welcomed and comfortable; a place which keeps you informed on your vehicle's progress; a place where people are willing to advise you with knowledgeable details; a place where you know they will provide high quality work and guarantee what they deliver. Most of all, bring your vehicle to a place you can trust.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Why Choose Us</h2>
          <div style={styles.valuesGrid}>
            {values.map((value) => (
              <div key={value.title} style={styles.valueCard}>
                <div style={styles.valueIcon}>{value.icon}</div>
                <h3 style={styles.valueTitle}>{value.title}</h3>
                <p style={styles.valueText}>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Certifications & Affiliations</h2>
          <div style={styles.certificationsContainer}>
            <div style={styles.certificationImages}>
              <div style={styles.certImageWrapper}>
                <img
                  src="/assets/images/icar-certification.png"
                  alt="I-CAR Gold Class Certification"
                  style={styles.certImage}
                />
              </div>
              <div style={styles.certImageWrapper}>
                <img
                  src="/assets/images/car-brands.jpg"
                  alt="Certified for all major car brands"
                  style={styles.certImage}
                />
              </div>
            </div>
            <div style={styles.certificationsBox}>
              <ul style={styles.certList}>
                <li>I-CAR Gold Class Professional Certification</li>
                <li>Factory-Trained Technicians</li>
                <li>Certified for All Major Auto Manufacturers</li>
                <li>VW, BMW, Mazda, Honda, Audi, Infiniti, Cadillac Certified</li>
                <li>Volvo, Mercedes, Lexus, Nissan, Toyota Certified</li>
                <li>Porsche, Acura, Subaru, Saab Certified</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Team</h2>
          <p style={styles.paragraph}>
            Fast, Friendly and Professional Service is always our goal. <strong><em>Experience the difference.</em></strong>
          </p>
          <p style={styles.paragraph}>
            Our team at Bellevue Collision Services is made up of highly motivated personnel who share in our personal commitment of customer trust and satisfaction. We realize that the customer is the person we work for, and our team is dedicated to providing reliable service as well as protecting the personal rights of our customers.
          </p>
          <p style={styles.paragraph}>
            We maintain a continuous training program to stay ahead of new innovations in the automotive repair industry. This ensures that your vehicle receives the quality service that you demand from a leader in collision repair.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
};

const values = [
  {
    icon: "🏆",
    title: "Over 30 Years Experience",
    description:
      "Three decades of industry expertise serving the Bellevue community with exceptional collision repair services.",
  },
  {
    icon: "🎓",
    title: "I-CAR Gold Class Certified",
    description:
      "Our technicians are certified by world-recognized institutions and maintain continuous training programs.",
  },
  {
    icon: "🛡️",
    title: "Lifetime Warranty",
    description:
      "100% lifetime warranty on all craftsmanship. We stand behind our work completely.",
  },
  {
    icon: "🚗",
    title: "Free Towing",
    description:
      "We offer free towing services with 24-hour emergency availability to help you when you need it most.",
  },
  {
    icon: "🎨",
    title: "Computerized Paint Matching",
    description:
      "State-of-the-art paint matching system to reproduce any factory finish with precision.",
  },
  {
    icon: "🤝",
    title: "Insurance Partners",
    description:
      "We work directly with every insurance company, making your claims process smooth and hassle-free.",
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
  section: {
    padding: "3rem 0",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "2rem",
    textAlign: "center" as const,
  },
  storyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "2rem",
  },
  storyContent: {
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#555",
  },
  paragraph: {
    marginBottom: "1.5rem",
  },
  missionBox: {
    background: "linear-gradient(135deg, #0047AB 0%, #0066CC 100%)",
    color: "#fff",
    padding: "3rem",
    borderRadius: "8px",
    textAlign: "center" as const,
  },
  missionText: {
    fontSize: "1.5rem",
    lineHeight: "1.8",
    margin: 0,
  },
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  valueCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  valueIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  valueTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  valueText: {
    color: "#666",
    lineHeight: "1.6",
  },
  certificationsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },
  certificationImages: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    flexWrap: "wrap" as const,
  },
  certImageWrapper: {
    backgroundColor: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  certImage: {
    maxWidth: "200px",
    height: "auto",
    display: "block",
  },
  certificationsBox: {
    backgroundColor: "#f8f9fa",
    padding: "2rem",
    borderRadius: "8px",
  },
  certList: {
    fontSize: "1.1rem",
    lineHeight: "2",
    color: "#555",
    maxWidth: "600px",
    margin: "0 auto",
  },
};

export default About;
