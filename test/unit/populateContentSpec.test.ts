/*
* A test suite for the populateContentSpec function.
* @group unit/cli/pupulateContentSpec
*/
import * as YAML from 'yaml';
import { updateContentSpecString } from '../../src/cli/populateContentSpec';

// Given an empty content spec it generates a valid content spec
test('Given an empty content spec it generates a valid content spec', () => {
  // GIVEN an empty content spec
  const initialContentSpecString = YAML.stringify({ version: '2.0' });
  // WHEN populateContentSpec is called
  const contentSpec = YAML.parse(updateContentSpecString(initialContentSpecString, 'us-east-1'));

  // THEN it returns a valid content spec
  expect(contentSpec).toBeDefined();
  expect(contentSpec.version).toEqual('2.0');
  expect(contentSpec.infrastructure).toBeDefined();
});