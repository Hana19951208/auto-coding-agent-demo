import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This page is protected by middleware, but we also check here for safety
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header user={user} />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            我的项目
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            您还没有创建任何项目。点击下方按钮开始创建。
          </p>
          <a
            href="/create"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            创建新项目
          </a>
        </div>
      </main>
    </div>
  );
}
