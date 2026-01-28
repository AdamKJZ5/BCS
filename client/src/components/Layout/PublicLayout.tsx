import { ReactNode } from "react";
import Header from "../Navigation/Header";
import Footer from "../Navigation/Footer";
import AnnouncementBar from "../AnnouncementBar";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div style={styles.wrapper}>
      <Header />
      <AnnouncementBar />
      <main style={styles.main} className="page-transition">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  },
  main: {
    flex: 1,
  },
};

export default PublicLayout;
