import { DeleteButton } from './forms';
import { deletePetAction } from '@/app/actions';
import Link from 'next/link';
import type { Pet } from '@prisma/client';
import { Pencil, FileText } from 'lucide-react';
import { PetAvatar } from './ui';
import { ageLabel } from '@/lib/dates';

export function PetWorkspaceHeader({ pet }: { pet: Pet }) {
  return (
    <section className="panel profile pet-workspace-header">
      <PetAvatar species={pet.species} large photoUrl={pet.photoUrl} name={pet.name} />
      <div className="profile-info">
        <p className="eyebrow">
          {pet.species} · {ageLabel(pet.birthDate)}
        </p>
        <h1>{pet.name}</h1>
        <p>{pet.breed || 'Breed not recorded'}</p>
        <div className="pet-header-actions">
          <Link className="button secondary" href={`/pets/${pet.id}?action=edit-pet`}>
            <Pencil size={16} /> Edit pet
          </Link>
          <Link className="button secondary" href={`/pets/${pet.id}/summary`}>
            <FileText size={16} aria-hidden="true" /> Care summary
          </Link>
          <DeleteButton
            action={deletePetAction.bind(null, pet.id)}
            label="Delete pet"
            description={`This permanently deletes ${pet.name} and all their medical records and documents. This cannot be undone.`}
          />
        </div>
      </div>
    </section>
  );
}
