import { Navigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { getAuthToken } from '../lib/api';

export default function RegisterPage() {
  if (getAuthToken()) {
    return <Navigate replace to="/" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
          <p className="text-sm text-slate-600">Register to start managing boards and tasks.</p>
        </div>
        <AuthForm mode="register" />
      </section>
    </main>
  );
}
