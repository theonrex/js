import { getCurrentUser } from "@/lib/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  console.log("user", user);
  return (
    <main className="flex flex-col items-center justify-center w-full">
      {children}
    </main>
  );
}
