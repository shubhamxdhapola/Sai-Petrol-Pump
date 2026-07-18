import { useSelector } from 'react-redux';
import PageHeader from '../../components/PageHeader';
import { initials } from '../../utils/formatters';
import Loader from '../../components/Loader';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <>
        <PageHeader title="Profile" subtitle="View your account details." />
        <Loader className="min-h-[280px]" size="lg" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="View your account details." />
      <section className="soft-card max-w-3xl p-8">
        <div className="flex items-center gap-6"><div className="grid h-24 w-24 place-items-center rounded-full bg-blue-100 text-3xl font-bold text-brand">{initials(user.name)}</div><div><h2 className="text-3xl font-bold">{user.name}</h2><p className="mt-2 capitalize text-muted">{user.role}</p></div></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <p><span className="text-muted">Phone</span><br /><strong>+91 {user.phone}</strong></p>
          <p><span className="text-muted">Account Status</span><br /><strong className={user.isActive ? 'text-emerald-600' : 'text-red-500'}>{user.isActive ? 'Active' : 'Inactive'}</strong></p>
        </div>
      </section>
    </>
  );
}
