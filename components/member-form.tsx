'use client';
import { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { adminMemberAction } from '@/app/admin-actions';
import type { ActionState } from '@/lib/validation';
export function MemberForm({
  alias = null,
  name = '',
  email = '',
}: {
  alias?: string | null;
  name?: string;
  email?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    adminMemberAction.bind(null, alias, 'save'),
    {},
  );
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.error) errorRef.current?.focus();
  }, [state.error]);
  return (
    <div className="member-editor">
      <Link className="text-link" href={alias ? `/admin/accounts/${alias}` : '/admin/accounts'}>
        ← {alias ? 'Back to member' : 'Account directory'}
      </Link>
      <header className="member-editor-heading">
        <p className="admin-eyebrow">MEMBER DETAILS</p>
        <h1>{alias ? 'Edit member' : 'Create member'}</h1>
        <p>
          {alias ? 'Update their profile and sign-in email.' : 'Add a member to your community.'}
        </p>
      </header>
      <form action={action} className="panel member-form" aria-busy={pending}>
        <h2>Account information</h2>
        {state.error && (
          <p className="error-box" role="alert" tabIndex={-1} ref={errorRef}>
            {state.error}
          </p>
        )}
        <div className="field">
          <label htmlFor="member-name">Name</label>
          <input
            id="member-name"
            name="name"
            defaultValue={state.values?.name ?? name}
            required
            maxLength={120}
            autoComplete="name"
            aria-invalid={!!state.fields?.name}
            aria-describedby={state.fields?.name ? 'member-name-error' : undefined}
          />
          {state.fields?.name && (
            <p id="member-name-error" className="field-error">
              {state.fields.name.join(' ')}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="member-email">Email</label>
          <input
            id="member-email"
            name="email"
            type="email"
            defaultValue={state.values?.email ?? email}
            required
            maxLength={254}
            autoComplete="email"
            aria-invalid={!!state.fields?.email}
            aria-describedby={
              state.fields?.email ? 'member-email-error member-email-help' : 'member-email-help'
            }
          />
          {state.fields?.email && (
            <p id="member-email-error" className="field-error">
              {state.fields.email.join(' ')}
            </p>
          )}
        </div>
        <p id="member-email-help" className="form-help">
          Members sign in with their email. Changing the email signs out their current sessions.
        </p>
        <div className="member-form-actions">
          <button className="button primary" disabled={pending}>
            {pending ? 'Saving…' : alias ? 'Save member' : 'Create member'}
          </button>
          <Link
            className="button secondary"
            href={alias ? `/admin/accounts/${alias}` : '/admin/accounts'}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
