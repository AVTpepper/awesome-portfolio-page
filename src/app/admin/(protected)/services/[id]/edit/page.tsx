import { notFound } from "next/navigation";
import { getServiceById } from "@/lib/firebase/firestore";
import ServiceForm from "@/components/admin/ServiceForm";
import { updateService } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: Props) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Edit Service</h1>
      <ServiceForm
        initial={service}
        onSubmit={updateService.bind(null, id)}
      />
    </div>
  );
}
