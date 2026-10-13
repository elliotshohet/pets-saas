import { Empty } from '@/components/ui';
export default function NotFound() {
  return (
    <div className="panel">
      <Empty
        title="This page has wandered off."
        description="The link may be outdated, or this pet or record was deleted. Return to your pets to find an existing profile."
        href="/pets"
        action="Back to your pets"
      />
    </div>
  );
}
