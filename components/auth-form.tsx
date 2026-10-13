'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Brand } from './brand';
export function AuthForm({
  signup = false,
  demo,
}: {
  signup?: boolean;
  demo?: { email: string; password: string };
}) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  return (
    <main id="main" className="auth-page">
      <header className="auth-branding">
        <Brand />
        <p>A little care. A happier life together.</p>
      </header>
      <div className="panel">
        <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
        <p>Your pet family, privately cared for.</p>
        {demo && !signup && <p>Local demo admin is ready. Click Sign in to explore.</p>}
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError('');
            const form = event.currentTarget;
            const data = new FormData(form);
            try {
              const email = String(data.get('email')).trim();
              const password = String(data.get('password'));
              const result = signup
                ? await authClient.signUp.email({
                    name: String(data.get('name')).trim(),
                    email,
                    password,
                  })
                : await authClient.signIn.email({ email, password });
              if (result.error) {
                setError(
                  signup
                    ? 'Unable to create account. Check your details or sign in.'
                    : 'Unable to sign in. Check your email and password or try again later.',
                );
              } else window.location.replace('/dashboard');
            } catch {
              setError('Unable to connect. Please try again.');
            } finally {
              const field = form.elements.namedItem('password') as HTMLInputElement;
              field.value = '';
              setPending(false);
            }
          }}
        >
          {signup && (
            <label>
              Name
              <input name="name" required minLength={1} maxLength={100} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              defaultValue={signup ? undefined : demo?.email}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              defaultValue={signup ? undefined : demo?.password}
              type="password"
              required
              minLength={signup ? 12 : undefined}
              maxLength={128}
              autoComplete={signup ? 'new-password' : 'current-password'}
              aria-describedby={signup ? 'password-help' : undefined}
            />
          </label>
          {signup && <p id="password-help">Use 12–128 characters.</p>}
          {error && <p role="alert">{error}</p>}
          <button className="button primary" disabled={pending}>
            {pending ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <Link className="text-link" href={signup ? '/sign-in' : '/sign-up'}>
          {signup ? 'Already have an account? Sign in' : 'Create an account'}
        </Link>
      </div>
      <footer className="auth-footer">Made for the ones who make your day.</footer>
    </main>
  );
}
