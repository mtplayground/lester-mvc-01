import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

const apiPostMock = vi.fn();
const useAuthStoreMock = vi.fn();

vi.mock('../lib/api', () => ({
  api: {
    post: (...args: unknown[]) => apiPostMock(...args)
  }
}));

vi.mock('../stores/authStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) => useAuthStoreMock(selector)
}));

describe('AuthForm and Login flow', () => {
  beforeEach(() => {
    apiPostMock.mockReset();
    useAuthStoreMock.mockImplementation((selector) =>
      selector({
        token: null,
        isInitializing: false,
        loginWithToken: vi.fn().mockResolvedValue(true)
      })
    );
  });

  it('shows validation errors for invalid inputs', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('submits login and redirects to dashboard route', async () => {
    const user = userEvent.setup();
    apiPostMock.mockResolvedValue({ data: { token: 'jwt-token' } });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<div>Dashboard</div>} path="/" />
          <Route element={<LoginPage />} path="/login" />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'Password123!'
      });
    });

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});
