import React from "react"
import ToxenPlayer from "../ToxenPlayer/ToxenPlayer";
import "./PrimaryPanel.scss";
import { ActionIcon, Button, Tabs, useMantineTheme } from "@mantine/core";
import { useClickOutside, useResizeObserver, useViewportSize } from '@mantine/hooks';
import { IconMusic, IconX } from "@tabler/icons-react";
import MusicList from "../MusicList/MusicList";
import { useDraggable } from "react-use-draggable-scroll";

export default function PrimaryPanel() {
  const controller = ToxenPlayer.useController();
  const mantine = useMantineTheme();
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() => controller.primaryPanelOpen && controller.setPrimaryPanelOpen(false));
  const ref = React.useRef<HTMLDivElement>(null!);
  const { events } = useDraggable(ref, {
    applyRubberBandEffect: true,
  });
  const viewportSize = useViewportSize();
  const isMobile = viewportSize.width <= 768;

  const openPanel = React.useCallback(() => {
    controller.setPrimaryPanelOpen(true);
  }, []);

  return (
    <div ref={clickOutsideRef} className="toxen-primary-panel" style={{
      backgroundColor: mantine.colors["tBackdrop"][9],
      opacity: !isMobile && controller.isIdling && !controller.primaryPanelOpen ? 0 : undefined,
    }}>
      <Tabs defaultValue="musiclist" className="toxen-primary-panel-tabs" orientation={isMobile ? "horizontal" : "vertical"}>
        <Tabs.List position="left" className="toxen-primary-panel-tabs-list">
          <div
            style={{
              display: isMobile ? "none" : "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              padding: "10px 0",
              cursor: "pointer",
              backgroundColor: controller.primaryPanelOpen ? (mantine.colors["red"][7] + "55") : (mantine.colors[mantine.primaryColor][9] + "55"),
              transition: "background-color 0.2s ease-in-out",
              borderRadius: "50%",
            }}

            onClick={() => {
              controller.setPrimaryPanelOpen(!controller.primaryPanelOpen);
            }}
          >
            <IconX
              color={controller.primaryPanelOpen ? mantine.colors["red"][7] : mantine.colors[mantine.primaryColor][5]}
              style={{
                transition: "transform 0.2s ease-in-out",
                // If closed, rotate 45deg
                transform: controller.primaryPanelOpen ? "rotate(0deg)" : "rotate(-135deg)",
              }}
              size={32}
            />
          </div>
          <Tabs.Tab icon={<IconMusic size={32} color={mantine.colors[mantine.primaryColor][5]} />} value="musiclist" onClick={openPanel} />
        </Tabs.List>

        <div ref={ref} {...events} className={[
          "toxen-primary-panel-tabs-content",
          controller.primaryPanelOpen ? "toxen-primary-panel-tabs-content--active" : "",
        ].join(" ")}>
          <Tabs.Panel value="musiclist">
            <MusicList />
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  )
}
