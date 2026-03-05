export const formStyles = {
  shell: 'mx-auto max-w-2xl px-4 sm:px-0 pt-8',
  card: 'flex flex-col gap-6 rounded-[12px] border border-border bg-surface p-6 shadow-sm',
  header: 'space-y-4',
  eyebrow:
    'inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary',
  title: 'text-2xl font-bold text-text-primary',
  description: 'text-sm leading-relaxed text-text-secondary',
  form: 'mt-2 space-y-6',
  field: 'space-y-2',
  label: 'block text-sm font-semibold text-text-primary',
  checkboxRow: 'flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-4 text-sm text-text-primary transition-colors hover:border-primary cursor-pointer',
  checkbox: 'h-4 w-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-bg',
  checkboxLabel: 'text-sm text-text-primary',
  input:
    'w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70',
  inputError: 'border-error focus:border-error focus:ring-error',
  hint: 'text-xs text-text-secondary',
  errors: {
    list: 'mt-1 space-y-1',
    item: 'text-sm font-bold text-red-500',
    bullet: 'hidden',
  },
  alert:
    'rounded-xl border border-red-500 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500',
  actions: 'mt-8 flex justify-end',
};

export const buttonStyles = {
  primary:
    'inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-px cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-70',
  spinner: 'h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white cursor-wait',
};
