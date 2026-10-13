'use client';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, LoaderCircle, Trash2 } from 'lucide-react';
import { savePetAction, saveRecordAction } from '@/app/actions';
import { species, categories, categoryLabels, type ActionState } from '@/lib/validation';

function Errors({ state }: { state: ActionState }) {
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.error) summary.current?.focus();
  }, [state]);
  if (!state.error) return null;
  return (
    <div className="error-box" role="alert" tabIndex={-1} ref={summary}>
      <strong>{state.error}</strong>
      {state.fields && (
        <ul>
          {Object.entries(state.fields).flatMap(([field, messages]) =>
            messages?.map((message) => (
              <li key={field + message}>
                <a href={`#${field}`}>{message}</a>
              </li>
            )),
          )}
        </ul>
      )}
    </div>
  );
}
function Field({
  name,
  label,
  state,
  children,
}: {
  name: string;
  label: string;
  state: ActionState;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {state.fields?.[name] && (
        <span className="field-error" id={`${name}-error`}>
          {state.fields[name]?.join(' ')}
        </span>
      )}
    </div>
  );
}
function invalid(state: ActionState, name: string) {
  return {
    'aria-invalid': !!state.fields?.[name],
    'aria-describedby': state.fields?.[name] ? `${name}-error` : undefined,
  };
}
function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button className="button primary" disabled={pending} type="submit">
      {pending ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}{' '}
      {pending ? 'Saving…' : label}
    </button>
  );
}

type PetValues = {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  notes: string;
};
type SaveAction = (state: ActionState, form: FormData) => Promise<ActionState>;
export function PetForm({
  pet,
  currentDay,
  saveAction,
  cancelHref,
}: {
  pet?: PetValues;
  currentDay: string;
  saveAction?: SaveAction;
  cancelHref?: string;
}) {
  const [state, action, pending] = useActionState(
    saveAction ?? savePetAction.bind(null, pet?.id ?? null),
    {},
  );
  return (
    <form action={action} className="panel form-panel" aria-busy={pending}>
      <p className="form-help">
        Fields marked (required) must be filled in. Other fields can be left blank.
      </p>
      <Errors state={state} />
      <fieldset disabled={pending}>
        <div className="form-grid">
          <Field name="name" label="Pet name (required)" state={state}>
            <input
              id="name"
              name="name"
              required
              maxLength={80}
              defaultValue={state.values?.name ?? pet?.name}
              placeholder="e.g. Maple"
              {...invalid(state, 'name')}
            />
          </Field>
          <Field name="species" label="Species (required)" state={state}>
            <select
              id="species"
              name="species"
              defaultValue={state.values?.species ?? pet?.species ?? 'Dog'}
              {...invalid(state, 'species')}
            >
              {species.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field name="breed" label="Breed (optional)" state={state}>
            <input
              id="breed"
              name="breed"
              maxLength={100}
              defaultValue={state.values?.breed ?? pet?.breed}
              placeholder="e.g. Golden retriever"
              {...invalid(state, 'breed')}
            />
          </Field>
          <Field name="birthDate" label="Date of birth (optional)" state={state}>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              min="1900-01-01"
              max={currentDay}
              defaultValue={state.values?.birthDate ?? pet?.birthDate}
              {...invalid(state, 'birthDate')}
            />
          </Field>
        </div>
        <Field name="notes" label="A little about them (optional)" state={state}>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={2000}
            defaultValue={state.values?.notes ?? pet?.notes}
            placeholder="Habits, preferences, or anything useful to remember."
            {...invalid(state, 'notes')}
          />
        </Field>
      </fieldset>
      <div className="form-footer">
        <Link className="button secondary" href={cancelHref ?? (pet ? `/pets/${pet.id}` : '/pets')}>
          Cancel
        </Link>
        <span className="sr-only" role="status">
          {pending ? 'Saving your changes. Please wait.' : ''}
        </span>
        <Submit pending={pending} label={pet ? 'Save changes' : 'Add pet'} />
      </div>
    </form>
  );
}

type RecordValues = {
  id: string;
  title: string;
  category: string;
  date: string;
  provider: string;
  notes: string;
};
export function RecordForm({
  petId,
  record,
  currentDay,
  vaccination = false,
  saveAction,
  cancelHref,
}: {
  petId: string;
  record?: RecordValues;
  vaccination?: boolean;
  currentDay: string;
  saveAction?: SaveAction;
  cancelHref?: string;
}) {
  const [category, setCategory] = useState(
    record?.category ?? (vaccination ? 'VACCINATION' : 'CHECKUP'),
  );
  const [state, action, pending] = useActionState(
    saveAction ?? saveRecordAction.bind(null, petId, record?.id ?? null),
    {},
  );
  return (
    <form action={action} className="panel form-panel" aria-busy={pending}>
      <p className="form-help">
        Fields marked (required) must be filled in. Other fields can be left blank.
      </p>
      <Errors state={state} />
      <fieldset disabled={pending}>
        <Field name="title" label="Record title (required)" state={state}>
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={state.values?.title ?? record?.title}
            placeholder="e.g. Annual wellness visit"
            {...invalid(state, 'title')}
          />
        </Field>
        <div className="form-grid">
          <Field name="category" label="Category (required)" state={state}>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              {...invalid(state, 'category')}
            >
              {categories.map((item) => (
                <option value={item} key={item}>
                  {categoryLabels[item]}
                </option>
              ))}
            </select>
          </Field>
          <Field
            name="date"
            label={
              category === 'VACCINATION' ? 'Administered on (required)' : 'Record date (required)'
            }
            state={state}
          >
            <input
              id="date"
              name="date"
              type="date"
              required
              min="1900-01-01"
              max={currentDay}
              defaultValue={state.values?.date ?? record?.date ?? currentDay}
              {...invalid(state, 'date')}
            />
          </Field>
        </div>
        <Field name="provider" label="Vet or clinic (optional)" state={state}>
          <input
            id="provider"
            name="provider"
            maxLength={120}
            defaultValue={state.values?.provider ?? record?.provider}
            placeholder="e.g. Willow Veterinary Clinic"
            {...invalid(state, 'provider')}
          />
        </Field>
        <Field name="notes" label="Notes (optional)" state={state}>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            maxLength={5000}
            defaultValue={state.values?.notes ?? record?.notes}
            placeholder="What happened, instructions, and things to remember."
            {...invalid(state, 'notes')}
          />
        </Field>
      </fieldset>
      <div className="form-footer">
        <Link className="button secondary" href={cancelHref ?? `/pets/${petId}`}>
          Cancel
        </Link>
        <span className="sr-only" role="status">
          {pending ? 'Saving your changes. Please wait.' : ''}
        </span>
        <Submit pending={pending} label={record ? 'Save changes' : 'Add record'} />
      </div>
    </form>
  );
}
export function DeleteButton({
  action,
  label,
  description,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  label: string;
  description: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="button danger-quiet"
        onClick={() => dialog.current?.showModal()}
      >
        <Trash2 size={15} />
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => trigger.current?.focus()}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <form action={formAction} aria-busy={pending}>
          <h2 id={titleId}>{label}?</h2>
          <p id={descriptionId}>{description}</p>
          <Errors state={state} />
          <input name="confirm" value="yes" type="hidden" />
          <div className="form-footer">
            <button
              type="button"
              className="button secondary"
              autoFocus
              disabled={pending}
              onClick={() => dialog.current?.close()}
            >
              Keep it
            </button>
            <button type="submit" className="button danger" disabled={pending}>
              {pending ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
