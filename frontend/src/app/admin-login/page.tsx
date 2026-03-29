import React from 'react';
import { FadeIn } from '@/shared/ui/FadeIn';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata = {
  title: 'Admin Login | FACTORY SAAS'
};

export default function AdminLoginPage() {
  return (
    <FadeIn className="w-full flex items-center justify-center">
      <LoginForm />
    </FadeIn>
  );
}
