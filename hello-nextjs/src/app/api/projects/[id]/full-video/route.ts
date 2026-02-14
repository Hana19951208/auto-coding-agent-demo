/**
 * Full video merge API.
 * POST /api/projects/:id/full-video - Merge all scene videos into one file
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { createClient } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/db/projects";
import { getSignedUrl, uploadFile } from "@/lib/db/media";
import type { Video } from "@/types/database";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getLatestVideo(videos: Video[]): Video | null {
  if (!videos || videos.length === 0) {
    return null;
  }

  return [...videos]
    .sort((a, b) => b.version - a.version)[0] ?? null;
}

async function ensureFfmpegAvailable(): Promise<void> {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
  } catch {
    throw new Error("ffmpeg is not available on server");
  }
}

async function downloadToFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download segment: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
}

/**
 * POST /api/projects/:id/full-video
 * Returns: { success: true, url: string, fileName: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const tempDir = path.join(os.tmpdir(), `merge-${randomUUID()}`);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const project = await getProjectById(projectId, user.id);

    const orderedScenes = [...project.scenes].sort(
      (a, b) => a.order_index - b.order_index
    );

    const sceneVideos = orderedScenes
      .map((scene) => ({
        sceneId: scene.id,
        orderIndex: scene.order_index,
        video: getLatestVideo(scene.videos),
      }))
      .filter((item) => item.video && item.video.storage_path);

    if (sceneVideos.length === 0) {
      return NextResponse.json(
        { error: "No completed scene videos found for merging" },
        { status: 400 }
      );
    }

    await ensureFfmpegAvailable();
    await fs.mkdir(tempDir, { recursive: true });

    const concatListFile = path.join(tempDir, "concat.txt");
    const outputPath = path.join(tempDir, "full-video.mp4");
    const segmentPaths: string[] = [];

    for (const [index, item] of sceneVideos.entries()) {
      const signedUrl = await getSignedUrl(item.video!.storage_path, 3600);
      const segmentPath = path.join(tempDir, `segment-${index + 1}.mp4`);
      await downloadToFile(signedUrl, segmentPath);
      segmentPaths.push(segmentPath);
    }

    const concatContent = segmentPaths
      .map((segmentPath) => `file '${segmentPath.replace(/'/g, "'\\''")}'`)
      .join("\n");
    await fs.writeFile(concatListFile, concatContent, "utf8");

    await execFileAsync("ffmpeg", [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListFile,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputPath,
    ]);

    const mergedBuffer = await fs.readFile(outputPath);
    const fileName = `full-video-${Date.now()}.mp4`;
    const { url } = await uploadFile(user.id, projectId, fileName, mergedBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

    return NextResponse.json({
      success: true,
      url,
      fileName,
      sceneCount: sceneVideos.length,
    });
  } catch (error) {
    console.error("Error merging full video:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to merge full video",
      },
      { status: 500 }
    );
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

