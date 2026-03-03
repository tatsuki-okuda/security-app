// References: root/plan/override.md, root/doc/test/test.md
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EnrollFormView } from '../../_ui/components/EnrollFormView';

const noop = async () => {};

describe('登録フォーム表示', () => {
  it('メールと同意のエラーを表示する', () => {
    render(
      <EnrollFormView
        register={(name) => ({ name, onChange: () => {}, onBlur: () => {}, ref: () => {} })}
        onSubmit={noop}
        emailErrors={['メールアドレスを入力してください']}
        slackErrors={['Slack ID を入力してください']}
        consentErrors={['訓練への参加に同意してください']}
        formError=""
        submitButton={<button type="submit">登録</button>}
      />,
    );

    expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(screen.getByText('Slack ID を入力してください')).toBeInTheDocument();
    expect(screen.getByText('訓練への参加に同意してください')).toBeInTheDocument();
  });
});
