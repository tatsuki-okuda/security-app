import { EnrollForm } from '../../../features/enroll/_ui';

import { enrollAction } from './actions';

export default function Page() {
  return <EnrollForm action={enrollAction} />;
}
