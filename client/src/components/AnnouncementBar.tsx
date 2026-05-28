const AnnouncementBar = () => {
  const announcements = [
    "📞 Call us @ (425) 373-0308",
    "📍 Find us at 13434 SE 27th Pl, Bellevue WA 98005",
  ];

  return (
    <div style={styles.container}>
      <div style={styles.track}>
        {announcements.map((text, index) => (
          <span key={index} style={styles.item}>
            {text}
          </span>
        ))}
        {announcements.map((text, index) => (
          <span key={`copy-${index}`} style={styles.item}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "0.75rem 0",
    fontWeight: "bold",
    fontSize: "1.1rem",
    overflow: "hidden",
    borderBottom: "2px solid #0047AB",
    whiteSpace: "nowrap" as const,
  },
  track: {
    display: "inline-block",
    animation: "scroll-left 50s linear infinite",
    whiteSpace: "nowrap" as const,
  },
  item: {
    display: "inline-block",
    paddingLeft: "300px",
    paddingRight: "300px",
  },
};

export default AnnouncementBar;
