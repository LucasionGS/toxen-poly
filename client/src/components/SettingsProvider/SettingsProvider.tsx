import { ISettings } from "@shared/ISettings";
import createObjectReducer, { ObjectReducer } from "../../helpers/createObjectReducer";
import React from "react";
import ToxenApi from "../../Api/ToxenApi";

const useSettingsObject = createObjectReducer<Partial<ISettings>>();

const SettingsProviderContext = React.createContext<ReturnType<typeof useSettingsObject>>({
  set() { },
  get() { return undefined; },
  apply(data) { return data; },
  getMultiple() { return {} as any },
  state: {},
});

interface SettingsProviderProps {
  children: React.ReactNode;
}

function SettingsProvider(props: SettingsProviderProps) {
  const { children } = props;
  const usedSettings = useSettingsObject({});

  React.useEffect(() => {
    ToxenApi.getSettings().then(s => {
      usedSettings.apply(s.getRawData());
    });
  }, []);

  return (
    <SettingsProviderContext.Provider value={{
      state: usedSettings.state,
      get: usedSettings.get,
      getMultiple: usedSettings.getMultiple,
      set(k, v) {
        usedSettings.set(k, v);
        ToxenApi.saveSettings({ [k]: v });
      },
      apply(data) {
        usedSettings.apply(data);
        ToxenApi.saveSettings(data);
      }
    }}>
      {children}
    </SettingsProviderContext.Provider>
  )
}

export function useSettings() {
  return React.useContext(SettingsProviderContext);
}

export default SettingsProvider;