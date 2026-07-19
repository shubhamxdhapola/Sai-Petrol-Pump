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
      <section className="soft-card max-w-xl overflow-hidden !rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
        {/* Profile Card Header with subtle gradient */}
        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-8 py-10 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-6">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-2xl font-bold text-brand shadow-sm border border-slate-100/80 shrink-0">
            {initials(user.name)}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-slate-800">{user.name}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                {user.role}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {user.isActive ? 'Active Account' : 'Suspended'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="p-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Phone Number</span>
              <p className="mt-1.5 text-base font-bold text-slate-800">+91 {user.phone}</p>
            </div>
            
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Account Status</span>
              <p className="mt-1.5 flex items-center gap-2 text-base font-bold text-slate-800">
                <span className={`h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
