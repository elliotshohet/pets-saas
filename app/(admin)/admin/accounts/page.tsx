import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { adminAccounts } from '@/lib/admin-data';
export const metadata = { title: 'Admin accounts' };
const number = (value: number) => value.toLocaleString('en-US');
export default async function Accounts({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 200) : '';
  const filter = ['families', 'empty', 'activated', 'unrecorded'].includes(params.filter || '')
    ? params.filter!
    : '';
  const page = Math.min(100000, Math.max(1, Number.parseInt(params.page || '1') || 1));
  const directory = await adminAccounts(user.id, q, filter, page);
  const href = (page: number) =>
    '/admin/accounts?' + new URLSearchParams({ q, filter, page: String(page) });
  return (
    <div className="admin-dashboard">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">PETS / ACCOUNTS</p>
          <h1>Your community, at a glance.</h1>
          <p>Find an account and review its pet profiles and care history.</p>
        </div>
      </header>
      <section className="panel admin-directory" id="accounts">
        <div className="admin-section-heading">
          <div>
            <h2>Account directory</h2>
            <p>
              Usage directory · {number(directory.total)}{' '}
              {directory.total === 1 ? 'result' : 'results'}
            </p>
          </div>
          <span className="badge neutral">Private access</span>
        </div>
        <form action="/admin/accounts" className="admin-filters">
          <label>
            <span className="sr-only">Search accounts</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name or email"
              maxLength={200}
            />
          </label>
          <label>
            <span className="sr-only">Account filter</span>
            <select name="filter" defaultValue={filter}>
              <option value="">All accounts</option>
              <option value="families">With pets</option>
              <option value="empty">Getting started</option>
              <option value="unrecorded">Pets without records</option>
              <option value="activated">Recording care</option>
            </select>
          </label>
          <button className="button primary">Search</button>
          {(q || filter) && (
            <Link className="text-link" href="/admin/accounts">
              Clear
            </Link>
          )}
        </form>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Account</th>
                <th scope="col">Joined</th>
                <th scope="col">Pets</th>
                <th scope="col">Workspace</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {directory.users.map((account) => (
                <tr key={account.id}>
                  <td>
                    <Link className="admin-account-link" href={`/admin/accounts/${account.id}`}>
                      <span className="admin-avatar" aria-hidden="true">
                        A
                      </span>
                      <span>
                        <strong>{account.label}</strong>
                        <small>{account.email}</small>
                      </span>
                    </Link>
                  </td>
                  <td>{account.joinedMonth}</td>
                  <td>{account.petCount}</td>
                  <td>
                    <span className={`badge ${account.petCount ? 'neutral' : ''}`}>
                      {account.petCount ? 'Pet family' : 'Getting started'}
                    </span>
                  </td>
                  <td>{account.isSynthetic ? 'Synthetic' : 'User-provided'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!directory.users.length && (
            <p className="admin-empty">
              No accounts match your search. Try another name or email or clear the filters.
            </p>
          )}
        </div>
        <nav aria-label="Account pagination" className="admin-pagination">
          <span>
            Page {directory.current} of {Math.max(1, Math.ceil(directory.total / 20))}
          </span>
          <div>
            {directory.current > 1 && (
              <Link
                className="button secondary small"
                href={href(directory.current - 1) + '#accounts'}
              >
                Previous
              </Link>
            )}
            {directory.current * 20 < directory.total && (
              <Link
                className="button secondary small"
                href={href(directory.current + 1) + '#accounts'}
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      </section>
    </div>
  );
}
