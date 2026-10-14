import Link from 'next/link';
import { PetPortrait } from './pet-portrait';
import {
  ArrowRight,
  Bird,
  Cat,
  Dog,
  PawPrint,
  Plus,
  Rabbit,
  Search,
  HeartPulse,
  Cake,
} from 'lucide-react';
import type { Pet, MedicalRecord } from '@prisma/client';
import { ageLabel, daysUntilBirthday } from '@/lib/dates';
export function PetAvatar({
  species,
  large = false,
  photoUrl,
  name,
}: {
  species: string;
  large?: boolean;
  photoUrl?: string | null;
  name?: string;
}) {
  const Icon =
    species === 'Dog'
      ? Dog
      : species === 'Cat'
        ? Cat
        : species === 'Rabbit'
          ? Rabbit
          : species === 'Bird'
            ? Bird
            : PawPrint;
  return (
    <span className={`pet-avatar ${species.toLowerCase()} ${large ? 'large' : ''}`}>
      {photoUrl ? (
        // Private uploaded photos are delivered by the authorized media route.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name || `${species} photo`} loading="lazy" />
      ) : (
        <>
          <span className="portrait-halo" aria-hidden="true" />
          {large ? (
            <PetPortrait species={species} />
          ) : (
            <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
          )}
          {large && (
            <span className="portrait-spark" aria-hidden="true">
              ✦
            </span>
          )}
        </>
      )}
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {href && (
        <Link href={href} className="button primary">
          <Plus size={18} />
          {action}
        </Link>
      )}
    </header>
  );
}
export function Empty({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <PawPrint size={27} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link href={href} className="button secondary">
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function Notice({ value }: { value?: string }) {
  const messages: Record<string, string> = {
    created: 'Pet added. Their care story starts here.',
    updated: 'Pet details updated.',
    deleted: 'Pet and their medical records deleted.',
    'record-saved': 'Medical record saved.',
    'record-deleted': 'Medical record deleted.',
  };
  return value && messages[value] ? (
    <p className="notice" role="status">
      {messages[value]}
    </p>
  ) : null;
}
export function SearchBox({ placeholder, value }: { placeholder: string; value?: string }) {
  return (
    <div className="search-input">
      <Search size={18} />
      <input aria-label={placeholder} name="q" defaultValue={value} placeholder={placeholder} />
    </div>
  );
}
export function PetCard({ pet }: { pet: Pet & { records: MedicalRecord[] } }) {
  const birthdayDays = daysUntilBirthday(pet.birthDate);
  return (
    <Link href={`/pets/${pet.id}`} className="pet-card">
      <div className="pet-card-top">
        <PetAvatar species={pet.species} large photoUrl={pet.photoUrl} name={pet.name} />
        <ArrowRight size={19} />
      </div>
      <h3>{pet.name}</h3>
      <p>
        {pet.breed || pet.species} <span className="dot">·</span> {ageLabel(pet.birthDate)}
      </p>
      {birthdayDays !== null && (
        <div className="pet-birthday">
          <Cake size={16} aria-hidden="true" />
          <span>
            {birthdayDays === 0
              ? 'Birthday today!'
              : birthdayDays === 1
                ? 'Birthday tomorrow'
                : `${birthdayDays} days until birthday`}
          </span>
        </div>
      )}
      <div className="pet-card-footer">
        <span>
          <HeartPulse size={15} />
          {pet.records.length} {pet.records.length === 1 ? 'record' : 'records'}
        </span>
      </div>
    </Link>
  );
}
