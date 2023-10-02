// Create a useReducer hook based on T object that returns a { get, set, apply, getMultiple } object.
import { useReducer } from "react";

export default function createObjectReducer<T extends object>() {
  const reducer = (state: T, action: Partial<T>) => {
    return { ...state, ...action };
  };

  const useObjectReducer: (initialState: T) => ObjectReducer<T> = (initialState: T) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const get = <K extends keyof T>(key: K) => state[key];
    const set = <K extends keyof T>(key: K, value: T[K]) => dispatch({ [key]: value } as any);
    const apply = (data: Partial<T>) => dispatch(data);
    const getMultiple = <K extends keyof T>(...keys: K[]) => {
      const result = {} as Pick<T, K>;
      for (const key of keys) {
        result[key] = state[key];
      }
      return result;
    };
    return { state, get, set, apply, getMultiple };
  };

  return useObjectReducer;
}

export interface ObjectReducer<T extends object> {
  state: T;
  get: <K extends keyof T>(key: K) => T[K];
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  apply: (data: Partial<T>) => void;
  getMultiple: <K extends keyof T>(...keys: K[]) => Pick<T, K>;
}
