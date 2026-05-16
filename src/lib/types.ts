// All shared Firestore document interfaces.
// These match the shape of documents stored in Firestore collections.

// Structural alias — matches both firebase and firebase-admin Timestamp
// without importing either SDK (avoids bundling firebase-admin into client code).
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  imageUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatarUrl?: string;
  featured: boolean;
  order: number;
  createdAt: Timestamp;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  popular: boolean;
  order: number;
  updatedAt: Timestamp;
}

export interface SiteSettings {
  about: {
    bio: string;
    skills: string[];
    profileImageUrl: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
  };
  contact: {
    email: string;
    socials: {
      github?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
}

