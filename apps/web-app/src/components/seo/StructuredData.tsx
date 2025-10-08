export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://autamedica.com/#organization',
        name: 'AutaMedica',
        url: 'https://autamedica.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://autamedica.com/logo.png',
          width: 512,
          height: 512
        },
        description: 'Plataforma de telemedicina sin fricciones con IA médica',
        sameAs: [
          'https://twitter.com/autamedica',
          'https://linkedin.com/company/autamedica'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://autamedica.com/#website',
        url: 'https://autamedica.com',
        name: 'AutaMedica',
        description: 'Telemedicina sin fricciones',
        publisher: {
          '@id': 'https://autamedica.com/#organization'
        },
        inLanguage: 'es-AR'
      },
      {
        '@type': 'MedicalBusiness',
        '@id': 'https://autamedica.com/#business',
        name: 'AutaMedica',
        image: 'https://autamedica.com/og-image.jpg',
        url: 'https://autamedica.com',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Buenos Aires',
          addressCountry: 'AR'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '250'
        }
      },
      {
        '@type': 'SoftwareApplication',
        name: 'AutaMedica',
        operatingSystem: 'Web, iOS, Android',
        applicationCategory: 'HealthApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'ARS'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '250'
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
