import TestimonialForm from "@/components/admin/TestimonialForm";
import { createTestimonial } from "../actions";

export default function NewTestimonialPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">New Testimonial</h1>
      <TestimonialForm onSubmit={createTestimonial} />
    </div>
  );
}
