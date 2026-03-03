import { buttonStyles } from '../../../../shared/ui/styles/formStyles';

type Props = {
  isPending: boolean;
};

export const SubmitButton = ({ isPending }: Props) => {
  return (
    <button type="submit" disabled={isPending} className={buttonStyles.primary}>
      {isPending && <span aria-hidden className={buttonStyles.spinner} />}
      <span>{isPending ? '登録中…' : '登録'}</span>
    </button>
  );
};
