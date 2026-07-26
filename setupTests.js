import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import jestFetchMock from 'jest-fetch-mock';

Object.assign(globalThis, { TextEncoder, TextDecoder });

jestFetchMock.enableMocks();
