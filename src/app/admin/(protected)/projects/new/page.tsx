import ProjectForm from "@/components/admin/ProjectForm";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">New Project</h1>
      <ProjectForm onSubmit={createProject} />
    </div>
  );
}
