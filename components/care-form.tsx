'use client';
import { useActionState, useEffect, useRef } from 'react';
import { careAction } from '@/app/care-actions';
export function CareForm({
  petId,
  operation,
  label,
  children,
}: {
  petId: string;
  operation: string;
  label: string;
  children: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(careAction.bind(null, petId, operation), {});
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef<{ name: string; value: string; checked?: boolean }[]>([]);
  const message = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.error) {
      for (const item of submitted.current) {
        const field = formRef.current?.elements.namedItem(item.name);
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement ||
          field instanceof HTMLSelectElement
        ) {
          field.value = item.value;
          if (field instanceof HTMLInputElement && item.checked !== undefined)
            field.checked = item.checked;
        }
      }
      message.current?.focus();
    } else if (state.success) submitted.current = [];
  }, [state]);
  return (
    <form
      ref={formRef}
      action={action}
      className="care-form"
      aria-busy={pending}
      onSubmit={(event) => {
        submitted.current = Array.from(event.currentTarget.elements).flatMap((field) => {
          if (
            (field instanceof HTMLInputElement ||
              field instanceof HTMLTextAreaElement ||
              field instanceof HTMLSelectElement) &&
            field.name &&
            !(field instanceof HTMLInputElement && field.type === 'file')
          )
            return [
              {
                name: field.name,
                value: field.value,
                checked:
                  field instanceof HTMLInputElement && field.type === 'checkbox'
                    ? field.checked
                    : undefined,
              },
            ];
          return [];
        });
      }}
    >
      <fieldset disabled={pending}>{children}</fieldset>
      {state.error && (
        <p role="alert" tabIndex={-1} ref={message}>
          {state.error}
        </p>
      )}
      {state.success && <p role="status">{state.success}</p>}
      <button className="button secondary" disabled={pending}>
        {pending ? 'Saving…' : label}
      </button>
    </form>
  );
}
export function PrintButton() {
  return (
    <button className="button primary no-print" onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}
