import { getSiteSettings, getFeaturedProjects, getServices, getFeaturedTestimonials } from "@/lib/firebase/firestore";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";

export default async function LandingPage() {
  const [settings, projects, services, testimonials] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getServices(),
    getFeaturedTestimonials(),
  ]);

  return (
    <div className="flex flex-col">
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <ProjectsSection projects={projects} />
      <ServicesSection services={services} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection />
    </div>
  );
}
