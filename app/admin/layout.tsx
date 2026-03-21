import React from 'react';
import AdminLayoutWrapper from '../../components/Admin/AdminLayoutWrapper';

export const metadata = {
    title: 'Admin Portal | SawaFlix',
    description: 'SawaFlix Administration and Verification Portal',
};

import { redirect } from 'next/navigation';
import { checkAuth } from '../(auth)/actions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { authenticated, role } = await checkAuth();

    if (!authenticated || role !== 'admin') {
        redirect('/login?error=Unauthorized+access');
    }

    return (
        <AdminLayoutWrapper>
            {children}
        </AdminLayoutWrapper>
    );
}
