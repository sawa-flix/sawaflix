import { NextResponse } from "next/server";
import { getNextEmailJob } from "@/lib/emailQueue";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/sendEmail";

export async function GET() {
  let processedCount = 0;
  const MAX_PER_RUN = 10; // Prevent the function from timing out

  try {
    // Process a small batch of jobs
    for (let i = 0; i < MAX_PER_RUN; i++) {
      const job = await getNextEmailJob();

      if (!job) break; // Exit if queue is empty

      if (job.type === "approval") {
        await sendApprovalEmail(job.email, job.stageName);
      } else if (job.type === "rejection") {
        await sendRejectionEmail(job.email, job.reason!);
      } else if (job.type === "admin_alert") {
        // Handle your Admin alerts here too!
        // await sendAdminAlert(job.email, job.stageName);
      }

      processedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedCount,
      message: processedCount > 0 ? `Sent ${processedCount} emails` : "Queue empty"
    });

  } catch (error: any) {
    console.error("Worker Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}