import { redirect } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { getSessionServer } from "@/lib/auth";
import Chatbot from "@/components/Chatbot";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionServer();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-pattern">
      <Navbar user={session.user} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="glass-effect rounded-2xl p-6 shadow-2xl">
          {children}
        </div>
      </main>
      {session.user?.id && <Chatbot userId={Number(session.user.id)} />}
    </div>
  );
}
