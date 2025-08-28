export interface StructuredDataConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'person' | 'organization';
  datePublished?: string;
  dateModified?: string;
  author?: string;
  keywords?: string[];
}

export function generateWebsiteStructuredData(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mayukh Bagchi - Astronomy Research",
    "alternateName": ["Mayukh Bagchi", "Mayukh Bagchi PhD", "VLBI Research"],
    "url": "https://mayukhbagchi.com",
    "description": "PhD candidate in astronomy & astrophysics specializing in balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies.",
    "author": {
      "@type": "Person",
      "name": "Mayukh Bagchi",
      "url": "https://mayukhbagchi.com",
      "sameAs": [
        "https://github.com/mayukh4",
        "https://www.linkedin.com/in/mayukh-bagchi/",
        "https://www.youtube.com/@mayukh_bagchi",
        "https://scholar.google.com/citations?user=mayukh_bagchi"
      ]
    },
    "publisher": {
      "@type": "Person",
      "name": "Mayukh Bagchi"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://mayukhbagchi.com/blogs?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "Person",
      "name": "Mayukh Bagchi",
      "jobTitle": "PhD Candidate in Astronomy & Astrophysics",
      "worksFor": {
        "@type": "Organization",
        "name": "Queen's University",
        "url": "https://www.queensu.ca"
      },
      "knowsAbout": [
        "VLBI Instrumentation",
        "Black Hole Imaging", 
        "Radio Astronomy",
        "Balloon-borne Instrumentation",
        "Astrophysics",
        "Photon Rings"
      ]
    }
  };
}

export function generatePersonStructuredData(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Mayukh Bagchi",
    "givenName": "Mayukh",
    "familyName": "Bagchi",
    "jobTitle": "PhD Candidate in Astronomy & Astrophysics",
    "description": "PhD candidate specializing in balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies",
    "url": "https://mayukhbagchi.com",
    "image": "https://mayukhbagchi.com/og-image.jpg",
    "email": "mailto:mayukh.bagchi@queensu.ca",
    "alumniOf": {
      "@type": "Organization",
      "name": "Queen's University",
      "url": "https://www.queensu.ca"
    },
    "affiliation": {
      "@type": "Organization", 
      "name": "Queen's University",
      "url": "https://www.queensu.ca"
    },
    "sameAs": [
      "https://github.com/mayukh4",
      "https://www.linkedin.com/in/mayukh-bagchi/",
      "https://www.youtube.com/@mayukh_bagchi",
      "https://scholar.google.com/citations?user=mayukh_bagchi"
    ],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "PhD Candidate in Astronomy & Astrophysics",
      "description": "Research in balloon-borne high-frequency VLBI instrumentation for black hole imaging",
      "skills": [
        "VLBI Instrumentation",
        "Radio Astronomy",
        "Black Hole Imaging",
        "Photon Rings", 
        "Balloon-borne Systems",
        "RFSoC Programming",
        "Astronomical Data Analysis"
      ]
    },
    "knowsAbout": [
      "Very Long Baseline Interferometry",
      "Black Hole Physics",
      "Radio Astronomy Instrumentation",
      "High-frequency VLBI Systems",
      "Balloon-borne Astronomy",
      "Photon Ring Detection",
      "RFSoC Technology",
      "Millimeter Wave Astronomy"
    ],
    "memberOf": [
      {
        "@type": "Organization",
        "name": "International Astronomical Union"
      },
      {
        "@type": "Organization", 
        "name": "Canadian Astronomical Society"
      }
    ]
  };
}

export function generateBreadcrumbStructuredData(items: Array<{name: string; url: string}>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateArticleStructuredData(config: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  wordCount?: number;
  readingTime?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": config.title,
    "description": config.description,
    "url": config.url,
    "image": config.image ? [config.image] : ["https://mayukhbagchi.com/og-image.jpg"],
    "datePublished": config.datePublished,
    "dateModified": config.dateModified || config.datePublished,
    "author": {
      "@type": "Person",
      "name": "Mayukh Bagchi",
      "url": "https://mayukhbagchi.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mayukh Bagchi - Astronomy Research",
      "url": "https://mayukhbagchi.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mayukhbagchi.com/logo.png",
        "width": 512,
        "height": 512
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": config.url
    },
    "keywords": config.keywords?.join(', '),
    "wordCount": config.wordCount,
    "timeRequired": config.readingTime,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "about": [
      {
        "@type": "Thing",
        "name": "Astronomy"
      },
      {
        "@type": "Thing", 
        "name": "Astrophysics"
      },
      {
        "@type": "Thing",
        "name": "VLBI Technology"
      }
    ]
  };
}

export function generateVideoStructuredData(config: {
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  contentUrl?: string;
  uploadDate: string;
  duration?: string;
  viewCount?: number;
  keywords?: string[];
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": config.title,
    "description": config.description,
    "thumbnailUrl": config.thumbnailUrl,
    "uploadDate": config.uploadDate,
    "duration": config.duration,
    "embedUrl": config.embedUrl,
    "contentUrl": config.contentUrl,
    "url": config.url,
    "author": {
      "@type": "Person",
      "name": "Mayukh Bagchi",
      "url": "https://mayukhbagchi.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mayukh Bagchi - Astronomy Research",
      "url": "https://mayukhbagchi.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mayukhbagchi.com/logo.png"
      }
    },
    "keywords": config.keywords?.join(', '),
    "inLanguage": "en-US",
    "interactionStatistic": config.viewCount ? {
      "@type": "InteractionCounter",
      "interactionType": "http://schema.org/WatchAction",
      "userInteractionCount": config.viewCount
    } : undefined,
    "about": [
      {
        "@type": "Thing",
        "name": "Astronomy Education"
      },
      {
        "@type": "Thing",
        "name": "Science Communication"
      }
    ]
  };
}

export function generateResearchProjectStructuredData(config: {
  name: string;
  description: string;
  url: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  fundingOrganization?: string;
  keywords?: string[];
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "ResearchProject",
    "name": config.name,
    "description": config.description,
    "url": config.url,
    "image": config.image,
    "startDate": config.startDate,
    "endDate": config.endDate,
    "author": {
      "@type": "Person",
      "name": "Mayukh Bagchi",
      "url": "https://mayukhbagchi.com"
    },
    "funder": config.fundingOrganization ? {
      "@type": "Organization",
      "name": config.fundingOrganization
    } : undefined,
    "about": config.keywords?.map(keyword => ({
      "@type": "Thing",
      "name": keyword
    })),
    "inLanguage": "en-US"
  };
}

export function generateFAQStructuredData(faqs: Array<{question: string; answer: string}>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

