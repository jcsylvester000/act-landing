import { Suspense } from 'react';
import { RegisterPage } from '@/components/auth/AuthPages';

export default function Register() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
