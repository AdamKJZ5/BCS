import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title = "Bellevue Collision Services - Auto Body Repair & Collision Repair in Bellevue WA",
  description = "Over 30 years of expert auto body repair, collision repair, and painting services in Bellevue, WA. I-CAR Gold Class Certified. Lifetime warranty. Free towing. Call (425) 373-0308",
  keywords = "auto body repair Bellevue, collision repair Bellevue WA, car paint Bellevue, auto body shop Bellevue, collision center Bellevue, I-CAR certified, auto painting, dent repair, frame straightening, insurance claims, Bellevue auto repair",
  image = "/assets/images/logo.png",
  url = "http://www.bellevuecollisionservices.com",
  type = "website",
}: SEOProps) => {
  const businessName = "Bellevue Collision Services";
  const fullTitle = title.includes(businessName) ? title : `${title} | ${businessName}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={businessName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Business Information */}
      <meta name="geo.region" content="US-WA" />
      <meta name="geo.placename" content="Bellevue" />
      <meta name="geo.position" content="47.5951;-122.1551" />
      <meta name="ICBM" content="47.5951, -122.1551" />

      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoRepair",
          "@id": "http://www.bellevuecollisionservices.com",
          name: "Bellevue Collision Services",
          description:
            "Professional auto body repair and collision repair services in Bellevue, WA. I-CAR Gold Class Certified with over 30 years of experience.",
          image: "http://www.bellevuecollisionservices.com/assets/images/logo.png",
          logo: "http://www.bellevuecollisionservices.com/assets/images/logo.png",
          url: "http://www.bellevuecollisionservices.com",
          telephone: "(425) 373-0308",
          faxNumber: "(425) 373-0310",
          email: "info@bellevuecollisionservices.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "13434 SE 27th Pl",
            addressLocality: "Bellevue",
            addressRegion: "WA",
            postalCode: "98005",
            addressCountry: "US",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 47.5951,
            longitude: -122.1551,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "08:00",
              closes: "17:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "00:00",
              closes: "00:00",
              description: "By Appointment Only",
            },
          ],
          priceRange: "$$",
          paymentAccepted: "Cash, Credit Card, Insurance",
          currenciesAccepted: "USD",
          areaServed: {
            "@type": "City",
            name: "Bellevue",
            "@id": "https://en.wikipedia.org/wiki/Bellevue,_Washington",
          },
          sameAs: [
            "https://www.facebook.com/bellevuecollisionservices",
            "http://www.yelp.com/biz/bellevue-collision-services-bellevue",
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "100",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Auto Body Repair Services",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Collision Repair",
                  description:
                    "Complete collision repair services to restore your vehicle to pre-accident condition",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Auto Painting & Refinishing",
                  description: "Computerized color matching and professional auto painting",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Auto Body Repair",
                  description: "Expert dent repair, scratch repair, and body work",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Glass Repair & Replacement",
                  description: "Windshield and auto glass repair and replacement",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Free Towing",
                  description: "24-hour emergency towing service",
                },
              },
            ],
          },
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Certification",
              value: "I-CAR Gold Class Certified",
            },
            {
              "@type": "PropertyValue",
              name: "Warranty",
              value: "Lifetime Warranty on Craftsmanship",
            },
            {
              "@type": "PropertyValue",
              name: "Emergency Service",
              value: "24/7 Available",
            },
          ],
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
