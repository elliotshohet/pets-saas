import { ActionIcon } from '@/components/action-icon';
import Link from 'next/link';
import { ownedDb } from '@/lib/owned-db';
import { requireUser } from '@/lib/session';
import { species } from '@/lib/validation';
import { Empty, Notice, PageHeader, PetCard, SearchBox } from '@/components/ui';
export const metadata = { title: 'My pets' };
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const user = await requireUser();
  const db = ownedDb(user.id);
  const [pets, petCount] = await Promise.all([
    db.pet.findMany({
      where: {
        ...(params.q
          ? {
              OR: ['name', 'breed', 'species'].map((field) => ({
                [field]: { contains: params.q, mode: 'insensitive' },
              })),
            }
          : {}),
        ...(params.species ? { species: params.species } : {}),
      },
      include: { records: true },
      orderBy: { name: 'asc' },
    }),
    db.pet.count(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="THEIR HEALTH. YOUR ADVOCACY."
        title="My pets"
        description="Choose a pet to see their care, visits, and medical history."
        href="/pets/new"
        action="Add pet"
      />
      <Notice value={params.notice} />
      <section>
        <div className="section-heading">
          <div>
            <h2>Meet your little crew</h2>
            <p>A home for every pet’s health story.</p>
          </div>
        </div>
        <form className="filter-bar" action="/dashboard">
          <SearchBox placeholder="Search pets by name, breed, or species" value={params.q} />
          <select name="species" aria-label="Filter by species" defaultValue={params.species ?? ''}>
            <option value="">All species</option>
            {species.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <button className="button secondary">
            <ActionIcon label="Search" />
            Search
          </button>
          {(params.q || params.species) && (
            <Link href="/dashboard" className="text-link">
              Clear filters
            </Link>
          )}
        </form>
        <p className="results-count" role="status">
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
              title={petCount ? 'No pets match just yet.' : 'Every family starts with one.'}
              description={
                petCount
                  ? 'Try another name or clear your filters.'
                  : 'Add your first pet to start keeping their care in one place.'
              }
              href={petCount ? '/dashboard' : '/pets/new'}
              action={petCount ? 'Clear filters' : 'Add your first pet'}
            />
          </div>
        )}
      </section>
    </>
  );
}
