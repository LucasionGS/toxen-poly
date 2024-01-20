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
        <Button
          fullWidth
          key={x.uid + i}
          className="toxen-music-list-item"
          onClick={() => controller.play(x)}
          variant={current === x ? "filled" : "subtle"}
          // leftIcon={<img src={x.backgroundPath!} style={{
          //   maxWidth: 50,
          //   maxHeight: 50,
          // }} />}
        >
          {x.artist} - {x.title}
        </Button>
      ))}
    </div>
  )
};