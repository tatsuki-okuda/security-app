export const formStyles = {
  shell: 'mx-auto mt-12 max-w-xl px-4 sm:px-0',
  card: 'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-card backdrop-blur-12 sm:p-10',
  header: 'space-y-3',
  eyebrow:
    'inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700',
  title: 'text-2xl font-semibold text-slate-900',
  description: 'text-sm leading-relaxed text-slate-500',
  form: 'mt-8 space-y-6',
  field: 'space-y-2',
  label: 'flex items-center gap-2 text-sm font-semibold text-slate-800',
  checkboxRow: 'flex items-start gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700',
  checkbox: 'mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-200',
  checkboxLabel: 'text-sm leading-relaxed text-slate-700',
  input:
    'w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70',
  inputError: 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
  hint: 'text-xs text-slate-500',
  errors: {
    list: 'space-y-2',
    item: 'flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm shadow-rose-100',
    bullet: 'mt-1 h-1.5 w-1.5 rounded-full bg-rose-400',
  },
  alert:
    'rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-sm shadow-amber-100',
  actions: 'flex items-center justify-end',
};

export const buttonStyles = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:translate-y-[1px] hover:shadow-xl hover:shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none',
  spinner: 'h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white',
};
