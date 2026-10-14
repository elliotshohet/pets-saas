'use client';
import { ActionIcon } from '@/components/action-icon';
import { useState } from 'react';
import { Brand } from './brand';
export function EmailLogin({ defaultEmail }: { defaultEmail?: string }) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  return (
    <main id="main" className="auth-page">
      <header className="auth-branding">
        <Brand />
        <p>A little care. A happier life together.</p>
      </header>
      <div className="panel">
        <h1>Welcome to Pets</h1>
        <p>Enter an email to open its workspace. New emails start a new account.</p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError('');
            const email = String(new FormData(event.currentTarget).get('email')).trim();
            try {
              const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              if (!response.ok) {
                const failure = await response.json().catch(() => ({}));
                setError(
                  failure.message || 'Unable to log in. Check the email or try again later.',
                );
              } else {
                const data = await response.json();
                window.location.replace(data.redirect || '/dashboard');
              }
            } catch {
              setError('Unable to connect. Please try again.');
            } finally {
              setPending(false);
            }
          }}
        >
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              defaultValue={defaultEmail}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="button primary" disabled={pending}>
            <ActionIcon label="Continue" />
            {pending ? 'Opening workspace…' : 'Continue'}
          </button>
        </form>
        <p className="form-help">No password required. New emails create new workspaces.</p>
      </div>
      <footer className="auth-footer">Made for the ones who make your day.</footer>
    </main>
  );
}
