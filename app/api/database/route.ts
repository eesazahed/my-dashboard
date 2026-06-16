import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import {
  CloseDb,
  CreateDatabaseBackup,
  GetDatabasePath,
  ReopenDb,
  RemoveWalFiles,
  ValidateDatabaseFile,
} from "@/lib/server/db";

function IsDatabaseBackupFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".db") || lower.endsWith(".dbi");
}

export async function GET() {
  const tempPath = path.join(
    os.tmpdir(),
    `dashboard-export-${Date.now()}.db`,
  );

  try {
    const dbPath = GetDatabasePath();
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    await CreateDatabaseBackup(tempPath);

    const validation = ValidateDatabaseFile(tempPath);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            validation.reason ??
            "Live database could not be exported with dashboard tables",
        },
        { status: 500 },
      );
    }

    const bytes = fs.readFileSync(tempPath);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `dashboard-backup-${stamp}.db`;

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/x-sqlite3",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Database export failed:", error);
    return NextResponse.json(
      { error: "Failed to export database" },
      { status: 500 },
    );
  } finally {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      /* ignore */
    }
    try {
      ReopenDb();
    } catch {
      /* ignore */
    }
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!IsDatabaseBackupFile(file.name)) {
      return NextResponse.json(
        { error: "Choose a .db backup file exported from Settings" },
        { status: 400 },
      );
    }

    const dbPath = GetDatabasePath();
    const directory = path.dirname(dbPath);
    const uploadPath = path.join(directory, "dashboard.upload.db");
    const backupPath = path.join(
      directory,
      `dashboard.db.bak-${Date.now()}`,
    );

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(uploadPath, buffer);

    const validation = ValidateDatabaseFile(uploadPath);
    if (!validation.valid) {
      fs.unlinkSync(uploadPath);
      return NextResponse.json(
        { error: validation.reason ?? "Invalid SQLite database file" },
        { status: 400 },
      );
    }

    CloseDb();

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    fs.renameSync(uploadPath, dbPath);
    RemoveWalFiles(dbPath);
    ReopenDb();

    return NextResponse.json({ ok: true, backupPath });
  } catch (error) {
    console.error("Database import failed:", error);
    try {
      ReopenDb();
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      { error: "Failed to import database" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
