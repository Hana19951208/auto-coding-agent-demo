"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectActionsProps {
  projectId: string;
  title: string;
  story: string | null;
  style: string | null;
}

const STYLE_OPTIONS: Array<{ id: string; name: string }> = [
  { id: "realistic", name: "写实风格" },
  { id: "anime", name: "动漫风格" },
  { id: "cartoon", name: "卡通风格" },
  { id: "cinematic", name: "电影风格" },
  { id: "watercolor", name: "水彩风格" },
  { id: "oil_painting", name: "油画风格" },
  { id: "sketch", name: "素描风格" },
  { id: "cyberpunk", name: "赛博朋克" },
  { id: "fantasy", name: "奇幻风格" },
  { id: "scifi", name: "科幻风格" },
];

export function ProjectActions({
  projectId,
  title,
  story,
  style,
}: ProjectActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editStory, setEditStory] = useState(story ?? "");
  const [editStyle, setEditStyle] = useState(style ?? "realistic");
  const [error, setError] = useState<string | null>(null);

  const handleOpenEdit = () => {
    if (isSubmitting) return;
    setEditTitle(title);
    setEditStory(story ?? "");
    setEditStyle(style ?? "realistic");
    setError(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (isSubmitting) return;

    const normalizedTitle = editTitle.trim();
    if (!normalizedTitle) {
      setError("项目标题不能为空");
      return;
    }

    const normalizedStory = editStory.trim();
    if (!normalizedStory) {
      setError("故事内容不能为空");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: normalizedTitle,
          story: normalizedStory,
          style: editStyle,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "更新项目失败");
      }

      setIsEditOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新项目失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "删除项目失败");
      }

      router.push("/projects");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除项目失败");
    } finally {
      setIsSubmitting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleOpenEdit}
          disabled={isSubmitting}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          编辑项目
        </button>
        <button
          onClick={() => setIsDeleteOpen(true)}
          disabled={isSubmitting}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          删除项目
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              编辑项目
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-project-title"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  项目标题
                </label>
                <input
                  id="edit-project-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-project-story"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  故事内容
                </label>
                <textarea
                  id="edit-project-story"
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-project-style"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  视频风格
                </label>
                <select
                  id="edit-project-style"
                  value={editStyle}
                  onChange={(e) => setEditStyle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {STYLE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              删除项目
            </h3>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              删除后无法恢复，项目下的分镜、图片和视频也会被一并删除。确认继续吗？
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
