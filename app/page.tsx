import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FormLogin from "./(auth)/login/components/FormLogin";

export default async function Page() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex items-center justify-center md:h-screen bg-secondary dark:bg-background">
      <FormLogin />
    </main>
  );
}

