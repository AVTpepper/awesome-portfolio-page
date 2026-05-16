import ServiceForm from "@/components/admin/ServiceForm";
import { createService } from "../actions";

export default function NewServicePage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">New Service</h1>
      <ServiceForm onSubmit={createService} />
    </div>
  );
}
