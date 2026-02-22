import React from 'react';
import AdminLayoutWrapper from '../../components/Admin/AdminLayoutWrapper';

export const metadata = {
    title: 'Admin Portal | SawaFlix',
    description: 'SawaFlix Administration and Verification Portal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminLayoutWrapper>
            {children}
        </AdminLayoutWrapper>
    );
}
