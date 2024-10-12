import axios from 'axios';
import { jest } from '@jest/globals';

// Typowanie mocka Axios
jest.mock('axios');
export const mockedAxios = axios as jest.Mocked<typeof axios>;
