import React from "react";
import ToxenPlayer from "../ToxenPlayer/ToxenPlayer";
import ToxenApi from "../../Api/ToxenApi";
import "./MusicList.scss";
import Button from "../Button/Button";

export default function MusicList() {
  const controller = ToxenPlayer.useController();
  const current = controller.track;

  React.useEffect(() => {
    ToxenApi.getTracks().then(list => {
      controller.setTrackList(list);
      if (list.length > 0) {
        controller.play(list.find(x => x.title.includes("ZELDA")) ?? list[0]);
      }
    });
  }, []);

  return (
    <div className="toxen-app-music-list">
      <h3 style={{
        textAlign: "center",
      }}>Music List</h3>
      {controller.trackList.map((x, i) => (
        <div
          style={{
            position: "relative",
          }}
          className="toxen-app-music-list__item-container"
          >
          <div
            className="toxen-app-music-list__item-background"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url('${x.backgroundPath}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
          </div>
          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Button
              fullWidth
              key={x.uid + i}
              className="toxen-music-list-item"
              onClick={() => controller.play(x)}
              variant={current === x ? "filled" : "subtle"}
              style={{
                fontSize: "1.2em",
              }}
            // leftIcon={<img src={x.backgroundPath!} style={{
            //   maxWidth: 50,
            //   maxHeight: 50,
            // }} />}
            >
              {x.artist} - {x.title}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
};