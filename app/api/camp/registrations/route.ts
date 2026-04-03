import { NextResponse } from "next/server";
import { CampAuthError, assertCampAdminAccess } from "@/lib/camp/auth";
import { listCampRegistrations } from "@/lib/camp/repository";
import { summarizeRegistrationForSearch } from "@/lib/camp/utils";

export async function GET(request: Request) {
  try {
    await assertCampAdminAccess();
    const search = new URL(request.url).searchParams.get("q")?.toLowerCase() ?? "";
    const status = new URL(request.url).searchParams.get("status") ?? "all";
    const registrations = await listCampRegistrations();

    const filtered = registrations.filter((registration) => {
      const matchesSearch = search
        ? summarizeRegistrationForSearch(registration).includes(search)
        : true;
      const matchesStatus =
        status === "all" ? true : registration.status === status;

      return matchesSearch && matchesStatus;
    });

    return NextResponse.json({
      success: true,
      registrations: filtered,
    });
  } catch (error) {
    if (error instanceof CampAuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo cargar el panel.",
      },
      { status: 500 }
    );
  }
}
