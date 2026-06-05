import * as React from 'react';
import { act, create } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(<ThemedText>Snapshot test!</ThemedText>);
  });
  expect(tree!.toJSON()).toMatchSnapshot();
});
