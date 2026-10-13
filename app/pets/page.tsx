import Link from 'next/link';
import { db } from '@/lib/db';
import { Empty, Notice, PageHeader, PetCard, SearchBox } from '@/components/ui';
import { species } from '@/lib/validation';
export const metadata = { title: 'My pets' };
export default async function Pets({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; species?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const pets = await db.pet.findMany({
    where: {
      ...(params.q
        ? {
            OR: [
              { name: { contains: params.q, mode: 'insensitive' } },
              { breed: { contains: params.q, mode: 'insensitive' } },
              { species: { contains: params.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(params.species ? { species: params.species } : {}),
    },
    include: { records: true },
    orderBy: { name: 'asc' },
  });
  return (
    <>
      <PageHeader
        eyebrow="YOUR PET FAMILY"
        title="My pets"
        description="Different personalities. One place for all their care."
        href="/pets/new"
        action="Add a pet"
      />
      <Notice value={params.notice} />
      <form className="filter-bar" action="/pets">
        <SearchBox placeholder="Search pets by name, breed, or species" value={params.q} />
        <select name="species" aria-label="Filter by species" defaultValue={params.species ?? ''}>
          <option value="">All species</option>
          {species.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button className="button secondary">Search</button>
        {(params.q || params.species) && (
          <Link href="/pets" className="text-link">
            Clear filters
          </Link>
        )}
      </form>
      <p className="results-count">
        {pets.length} {pets.length === 1 ? 'pet' : 'pets'}
        {params.q || params.species ? ' found' : ' in your family'}
      </p>
      {pets.length ? (
        <div className="pet-grid">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="panel">
          <Empty
            title={
              params.q || params.species ? 'No pets match just yet.' : 'Let’s meet your first pet.'
            }
            description={
              params.q || params.species
                ? 'Try another name or clear your filters.'
                : 'A name and species are all you need to get started.'
            }
            href={params.q || params.species ? '/pets' : '/pets/new'}
            action={params.q || params.species ? 'Clear filters' : 'Add a pet'}
          />
        </div>
      )}
    </>
  );
}
