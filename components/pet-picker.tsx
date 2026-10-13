import Link from 'next/link';
import { ownedDb } from '@/lib/owned-db';
import { requireUser } from '@/lib/session';
import { Empty, PageHeader, PetAvatar } from './ui';
export async function PetPicker() {
  const db = ownedDb((await requireUser()).id);
  const pets = await db.pet.findMany({ orderBy: { name: 'asc' } });
  return (
    <>
      <PageHeader
        eyebrow="ONE PET AT A TIME"
        title="Who is this record for?"
        description="Choose a pet to add a medical record."
      />
      {pets.length ? (
        <div className="pet-grid">
          {pets.map((pet) => (
            <Link className="pet-card" key={pet.id} href={`/pets/${pet.id}/records/new`}>
              <PetAvatar species={pet.species} large />
              <h2>{pet.name}</h2>
              <p>{pet.breed || pet.species}</p>
              <span className="text-link">Add record →</span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="First, introduce your pet."
          description="Add a pet to start their care story."
          href="/pets/new"
          action="Add a pet"
        />
      )}
    </>
  );
}
