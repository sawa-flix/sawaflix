'use client'
import { useEffect, useState, Suspense } from "react";
import SawaFlix from "../../../components/Dashboard/SawaFlix";
import { createClient } from '../../../utils/supabase/client'
import { User as SupabseUser } from '@supabase/supabase-js'
import { useRouter } from "next/navigation";

type UserData = {
  username:string | null;
  role: string | null;
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<SupabseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
        .from('users')
        .select('username, role')
        .eq('id', user.id)
        .single<UserData>();

        if (error) {
          console.error('error fetching user:', error.message);
        } else if (profileData) {
          setUserProfile(profileData);
          
          // If admin, redirect to admin portal
          /*
          if (profileData.role === 'admin') {
            router.push('/admin');
          }
          */
        }
      }
    };
    fetchUser();
  }, []); // The useEffect runs once when the component mounts

  return (
    <div className="min-h-full">
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>}>
        <SawaFlix />
      </Suspense>
    </div>
  );
}