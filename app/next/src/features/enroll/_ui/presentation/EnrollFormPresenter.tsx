'use client';

import { EnrollFormView } from '../components/EnrollFormView';
import { useEnrollForm } from '../hooks/useEnrollForm';

import { SubmitButton } from './SubmitButton';

import type { EnrollActionState } from '../../contracts/enroll';

type Props = {
  action: (prev: EnrollActionState, formData: FormData) => Promise<EnrollActionState>;
};

export const EnrollForm = ({ action }: Props) => {
  const { register, handleSubmit, mergedEmailErrors, mergedConsentErrors, mergedSlackErrors, formError, isPending } =
    useEnrollForm(action);

  return (
    <EnrollFormView
      register={register}
      onSubmit={handleSubmit}
      emailErrors={mergedEmailErrors}
      consentErrors={mergedConsentErrors}
      slackErrors={mergedSlackErrors}
      formError={formError}
      submitButton={<SubmitButton isPending={isPending} />}
    />
  );
};
