// Declare process.env for TypeScript to avoid "Cannot find name 'process'" error
declare const process: {
  env: {
    [key: string]: string | undefined;
    REACT_APP_API_URL?: string;
  };
};

export const API_BASE: string =
  process.env.REACT_APP_API_URL ?? "http://localhost:5000";