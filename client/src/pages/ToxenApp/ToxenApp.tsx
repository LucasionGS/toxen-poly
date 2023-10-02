import React from "react";
import ToxenPlayer from "../../components/ToxenPlayer/ToxenPlayer";
import ToxenApi from "../../Api/ToxenApi";
import { MantineProvider, MantineThemeOverride, Button } from "@mantine/core";
import { useDraggable } from "react-use-draggable-scroll";
import "./ToxenApp.scss";
import MusicList from "../../components/MusicList/MusicList";
import PrimaryPanel from "../../components/PrimaryPanel/PrimaryPanel";
import { mergeDeep } from "../../helpers/mergeDeep";

const toxenThemes: Record<string, MantineThemeOverride> = {
  default: {
    colors: {
      primary: [
        // https://mantine.dev/colors-generator/?color=2BDD66
        '#e5feee',
        '#d2f9e0',
        '#a8f1c0',
        '#7aea9f',
        '#53e383',
        '#3bdf70',
        '#2bdd66',
        '#1ac455',
        '#0caf49',
        '#00963c'
      ],

      tBackdrop: [
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b",
        "#1b1b1b"
      ]
    },
    primaryColor: "primary",
  },
  hotGirlMusic: {
    colors: {
      // https://mantine.dev/colors-generator/?color=F018E8
      primary: [
        '#fbe5fb',
        '#f8d2f8',
        '#f2a8f2',
        '#ec7aec',
        '#e553e5',
        '#e03be0',
        '#dd2bdd',
        '#d61ac4',
        '#c40caf',
        '#b40996'
      ]
    }
  },
};

export default function ToxenApp() {
  const [themeName, setThemeName] = React.useState("default");

  const themeObject = React.useMemo(() => {
    const data: MantineThemeOverride = { colorScheme: "dark" };
    mergeDeep(data, toxenThemes.default);
    if (toxenThemes[themeName] && themeName !== "default") {
      mergeDeep(data, toxenThemes[themeName]);
    }
    return data;
  }, [themeName]);
  return (
    <MantineProvider theme={themeObject}>
      <ToxenPlayer.Provider>
        <div className="toxen-app">
          {/* <MusicList /> */}
          <ToxenPlayer
            width={"100%"}
            height={"100%"}
            background
            controls
            progressBar
            volumeSlider
            primaryPanel
          />
        </div>
      </ToxenPlayer.Provider>
    </MantineProvider>
  )
}