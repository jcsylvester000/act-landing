import { Suspense } from 'react';
import { LoginPage } from '@/components/auth/AuthPages';

export default function Login() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
