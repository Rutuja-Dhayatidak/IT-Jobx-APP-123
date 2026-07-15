const mockStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
};

jest.mock('@react-native-async-storage/async-storage', () => mockStorage);

// Dynamic Keychain mock supporting multiple services (prefixed with "mock" to satisfy scope rules)
const mockStoredPasswords = {};
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn((username, password, options) => {
    const service = options?.service || 'default';
    mockStoredPasswords[service] = password;
    return Promise.resolve(true);
  }),
  getGenericPassword: jest.fn((options) => {
    const service = options?.service || 'default';
    const password = mockStoredPasswords[service];
    if (password) {
      return Promise.resolve({ username: 'token', password });
    }
    return Promise.resolve(null);
  }),
  resetGenericPassword: jest.fn((options) => {
    const service = options?.service || 'default';
    delete mockStoredPasswords[service];
    return Promise.resolve(true);
  }),
}));

// Mock Native Document Picker
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(() => Promise.resolve([])),
  isErrorWithCode: jest.fn(() => false),
  errorCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  },
}));

jest.mock('lottie-react-native', () => 'LottieView');
