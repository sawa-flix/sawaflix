import { redis } from "./redis";

const EMAIL_QUEUE_KEY = "sawaflix_email_queue";

export type EmailJob = {
  type: "approval" | "rejection";
  email: string;
  stageName?: string;
  reason?: string;
};

export async function queueEmail(job: EmailJob) {
  try {
    // Add job to queue
    await redis.lpush(EMAIL_QUEUE_KEY, JSON.stringify(job));

    return {
      success: true,
      message: "Email added to queue",
    };

  } catch (error) {
    console.error("Redis Queue Error:", error);

    return {
      success: false,
      message: "Failed to queue email",
    };
  }
}

export async function getNextEmailJob(): Promise<EmailJob | null> {
  try {
    // Get next job from queue
    const job = await redis.rpop(EMAIL_QUEUE_KEY);

    if (!job) return null;

    // Parse JSON string into object
    const parsedJob: EmailJob = JSON.parse(job as string);

    return parsedJob;

  } catch (error) {
    console.error("Redis Worker Error:", error);
    return null;
  }
}