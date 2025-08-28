export const dynamic = "force-dynamic";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
