import React from "react"
import { useSettings } from "../SettingsProvider/SettingsProvider";

import "./SettingsSection.scss";
import Tabs from "../Tabs/Tabs";
import Slider from "../Slider/Slider";

export default function SettingsSection() {
  const settings = useSettings();
  return (
    <div className="toxen-settings-section">
      <Tabs defaultValue="general" orientation="vertical">
        <Tabs.List justify="left" orientation="horizontal">
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="themes">Themes</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general">
          <h3>General</h3>
          {/* <NumberInput
            label="Background Dim"
            value={settings.get("backgroundDim")}
            onChange={v => settings.set("backgroundDim", +v ?? 0)}
          /> */}
          <Slider
            value={settings.get("backgroundDim") ?? 0}
            onChange={v => settings.set("backgroundDim", +v)}
            label="Background Dim"
            min={0}
            max={100}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
