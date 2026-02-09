import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CreatePage() {
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
            创建新项目
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            创建项目页面将在后续任务中实现。
          </p>
          <a
            href="/projects"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            返回项目列表
          </a>
        </div>
      </main>
    </div>
  );
}
