type Props = {
  messages: string[];
  id?: string;
  className?: string;
  itemClassName?: string;
  bulletClassName?: string;
};

export const InlineError = ({ messages, id, className, itemClassName, bulletClassName }: Props) => {
  if (messages.length === 0) return null;

  return (
    <ul id={id} role="alert" aria-live="polite" className={className}>
      {messages.map((m) => (
        <li key={m} className={itemClassName}>
          {bulletClassName ? <span aria-hidden className={bulletClassName} /> : null}
          <span>{m}</span>
        </li>
      ))}
    </ul>
  );
};
