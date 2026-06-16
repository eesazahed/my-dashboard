import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  CloseDb,
  GetDatabasePath,
  ReopenDb,
  ValidateDatabaseFile,
} from "@/lib/server/db";

export async function GET() {
  try {
    const dbPath = GetDatabasePath();
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    const bytes = fs.readFileSync(dbPath);
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
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".db")) {
      return NextResponse.json(
        { error: "Only .db files are supported" },
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

    if (!ValidateDatabaseFile(uploadPath)) {
      fs.unlinkSync(uploadPath);
      return NextResponse.json(
        { error: "Invalid SQLite database file" },
        { status: 400 },
      );
    }

    CloseDb();

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    fs.renameSync(uploadPath, dbPath);
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
