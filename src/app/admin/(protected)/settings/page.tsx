import { getSiteSettings } from "@/lib/firebase/firestore";
import SettingsForm from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "./actions";

export const metadata = { title: "Site Settings | Admin" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  const initial = settings ?? {
    hero: { headline: "", subheadline: "", ctaPrimaryLabel: "", ctaSecondaryLabel: "" },
    about: { bio: "", skills: [], profileImageUrl: "" },
    contact: { email: "", socials: {} },
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Site Settings</h1>
      <SettingsForm initial={initial} onSubmit={updateSiteSettings} />
    </div>
  );
}
