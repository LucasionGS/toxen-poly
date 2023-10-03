import React from "react"
import { useSettings } from "../SettingsProvider/SettingsProvider";
import { NumberInput, Slider, Tabs, TextInput } from "@mantine/core";

import "./SettingsSection.scss";

export default function SettingsSection() {
  const settings = useSettings();
  return (
    <div className="toxen-settings-section">
      <Tabs defaultValue="general">
        <Tabs.List position="left">
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
            value={settings.get("backgroundDim")}
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
