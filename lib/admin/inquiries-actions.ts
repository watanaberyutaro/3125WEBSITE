"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";

export async function updateInquiryStatus(id: string, status: "new" | "in_progress" | "done"): Promise<void> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}
