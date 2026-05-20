import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/firebase/firestore";
import ProjectForm from "@/components/admin/ProjectForm";
import { updateProject } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Edit Project</h1>
      <ProjectForm
        initial={project}
        onSubmit={updateProject.bind(null, id)}
      />
    </div>
  );
}
