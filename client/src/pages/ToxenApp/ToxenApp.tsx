import React from "react";
import ToxenPlayer from "../../components/ToxenPlayer/ToxenPlayer";
import ToxenApi from "../../Api/ToxenApi";
import { MantineProvider, MantineThemeOverride, Button } from "@mantine/core";
import { useDraggable } from "react-use-draggable-scroll";
import "./ToxenApp.scss";

const toxenThemes: Record<string, MantineThemeOverride> = {
  default: {
    colors: {
      tGreen: [
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
      ]
    },
    primaryColor: "tGreen",
  },
  hotGirlMusic: {
    colors: {
      // https://mantine.dev/colors-generator/?color=F018E8
      tPink: [
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
    },
    primaryColor: "tPink",
  },
};
const currentTheme = toxenThemes.default;
// const currentTheme = toxenThemes.hotGirlMusic;

export default function ToxenApp() {

  return (
    <MantineProvider theme={currentTheme}>
      <ToxenPlayer.Provider>
        <div className="toxen-app">
          <MusicList />
          <ToxenPlayer
            width={"100%"}
            height={"100%"}
            background
            controls
            progressBar
            volumeSlider
          />
        </div>
      </ToxenPlayer.Provider>
    </MantineProvider>
  )
}

function MusicList() {
  const controller = ToxenPlayer.useController();
  const current = controller.track;
  const ref = React.useRef<HTMLDivElement>(null!);
  const { events } = useDraggable(ref, {
    applyRubberBandEffect: true,
  });

  React.useEffect(() => {
    ToxenApi.getTracks().then(list => {
      controller.setTrackList(list);
      if (list.length > 0) {
        controller.play(list.find(x => x.title.includes("ZELDA")) ?? list[0]);
      }
    });
  }, []);

  return (
    <div ref={ref} {...events} className="toxen-app-music-list">
      <h1 style={{
        textAlign: "center",
      }}>Music List</h1>
      {controller.trackList.map((x, i) => (
        <Button
          fullWidth
          key={x.uid + i}
          className="toxen-music-list-item"
          onClick={() => controller.play(x)}
          variant={current === x ? "filled" : "subtle"}
          leftIcon={<img src={x.backgroundPath!} style={{
            maxWidth: 50,
            maxHeight: 50,
          }} />}
        >
          {x.artist} - {x.title}
        </Button>
      ))}
    </div>
  )
}