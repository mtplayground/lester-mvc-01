import axios from 'axios';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../ui/Toast';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
}

interface FormValues {
  email: string;
  password: string;
  name: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1, 'Name is required')
});

const tokenSchema = z.object({
  token: z.string().min(1)
});

export default function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const loginWithToken = useAuthStore((state) => state.loginWithToken);
  const [values, setValues] = useState<FormValues>({
    email: '',
    password: '',
    name: ''
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === 'register';

  const schema = useMemo(() => (isRegisterMode ? registerSchema : loginSchema), [isRegisterMode]);

  function updateField(field: keyof FormValues, value: string): void {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const payload = isRegisterMode
      ? { email: values.email, password: values.password, name: values.name }
      : { email: values.email, password: values.password };

    const parsedPayload = schema.safeParse(payload);

    if (!parsedPayload.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsedPayload.error.issues) {
        const path = issue.path[0];

        if (typeof path === 'string' && path in values) {
          nextErrors[path as keyof FormValues] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
      const response = await api.post(endpoint, parsedPayload.data);
      const parsedResponse = tokenSchema.parse(response.data);
      const didAuthenticate = await loginWithToken(parsedResponse.token);

      if (!didAuthenticate) {
        setFormError('Authentication failed');
        showToast({
          type: 'error',
          title: 'Authentication failed',
          description: 'Please check your credentials and try again.'
        });
        return;
      }

      showToast({
        type: 'success',
        title: isRegisterMode ? 'Account created' : 'Signed in',
        description: isRegisterMode ? 'Welcome to Lester MVC' : 'Welcome back'
      });
      navigate('/', { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Authentication failed';
        setFormError(message);
        showToast({
          type: 'error',
          title: 'Authentication failed',
          description: message
        });
      } else {
        setFormError('Authentication failed');
        showToast({
          type: 'error',
          title: 'Authentication failed',
          description: 'Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isRegisterMode ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            autoComplete="name"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            onChange={(event) => updateField('name', event.target.value)}
            value={values.name}
          />
          {fieldErrors.name ? <p className="text-xs text-rose-600">{fieldErrors.name}</p> : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          autoComplete="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          onChange={(event) => updateField('email', event.target.value)}
          type="email"
          value={values.email}
        />
        {fieldErrors.email ? <p className="text-xs text-rose-600">{fieldErrors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          onChange={(event) => updateField('password', event.target.value)}
          type="password"
          value={values.password}
        />
        {fieldErrors.password ? <p className="text-xs text-rose-600">{fieldErrors.password}</p> : null}
      </div>

      {formError ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p> : null}

      <button
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Submitting...' : isRegisterMode ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-slate-600">
        {isRegisterMode ? 'Already have an account?' : 'Need an account?'}{' '}
        <Link className="font-medium text-slate-900 hover:underline" to={isRegisterMode ? '/login' : '/register'}>
          {isRegisterMode ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </form>
  );
}
