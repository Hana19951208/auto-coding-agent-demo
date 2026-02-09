import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";

interface HeaderProps {
  user: {
    email?: string;
  } | null;
}

/**
 * Header component that shows navigation and auth status.
 */
export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Spring FES Video
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/"
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              首页
            </Link>
            {user && (
              <>
                <Link
                  href="/projects"
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  我的项目
                </Link>
                <Link
                  href="/create"
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  创建项目
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-zinc-600 dark:text-zinc-400 sm:block">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
