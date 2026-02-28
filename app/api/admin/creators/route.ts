import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    try {
        const supabase = await createClient();
        
        // 1. Fetch submissions
        const { data: submissions, error: subError } = await supabase
            .from("verification_submissions")
            .select(`*`)
            .eq("status", status)
            .order("created_at", { ascending: true });

        if (subError) {
            console.error("❌ Admin Fetch Submissions Error:", subError.message);
            return NextResponse.json({ error: subError.message }, { status: 500 });
        }

        if (!submissions || submissions.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Fetch user details for those submissions
        const userIds = submissions.map((s: any) => s.creator_id);
        const { data: users, error: userError } = await supabase
            .from("users")
            .select("id, username, email, profile_image_url")
            .in("id", userIds);

        if (userError) {
            console.error("❌ Admin Fetch Users Error:", userError.message);
            // We don't fail the whole thing, just show unknown creators
        }

        // 3. Map users to submissions
        const userMap = (users || []).reduce((acc: any, user: any) => {
            acc[user.id] = user;
            return acc;
        }, {});

        const formattedData = submissions.map((sub: any) => {
            const user = userMap[sub.creator_id];
            return {
                id: sub.creator_id,
                full_name: user?.username || "Unknown Creator",
                email: user?.email,
                profile_image: user?.profile_image_url,
                verification_submissions: {
                    category: sub.category,
                    status: sub.status,
                    created_at: sub.created_at,
                    form_data: sub.form_data
                }
            };
        });

        return NextResponse.json(formattedData);

    } catch (err: any) {
        console.error("❌ Fatal Admin API Error:", err);
        return NextResponse.json({ 
            error: err.message, 
            stack: err.stack,
            cause: err.cause ? err.cause.message : null
        }, { status: 500 });
    }
}
