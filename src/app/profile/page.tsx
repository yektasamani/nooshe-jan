import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(`/users/${user.id}`);
}
