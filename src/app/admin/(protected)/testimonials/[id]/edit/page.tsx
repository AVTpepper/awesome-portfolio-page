import { notFound } from "next/navigation";
import { getTestimonialById } from "@/lib/firebase/firestore";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { updateTestimonial } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: Props) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);
  if (!testimonial) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Edit Testimonial</h1>
      <TestimonialForm
        initial={testimonial}
        onSubmit={(data) => updateTestimonial(id, data)}
      />
    </div>
  );
}
