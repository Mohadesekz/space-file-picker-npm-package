import { Constants } from './Constants';

export const throw_exception = error => {
  return {
    error,
    type: Constants.EXCEPTION_ERROR,
  };
};

export const themeMode = mode => {
  return {
    mode,
    type: Constants.THEME_MODE,
  };
};
