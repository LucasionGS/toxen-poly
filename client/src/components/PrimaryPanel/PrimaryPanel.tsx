import React from "react"
import ToxenPlayer from "../ToxenPlayer/ToxenPlayer";
import "./PrimaryPanel.scss";
import { useClickOutside, useResizeObserver, useViewportSize } from '@mantine/hooks';
import { IconMusic, IconSettings, IconX } from "@tabler/icons-react";
import MusicList from "../MusicList/MusicList";
import { useDraggable } from "react-use-draggable-scroll";
import SettingsSection from "../SettingsSection/SettingsSection";
import Tabs from "../Tabs/Tabs";

export default function PrimaryPanel() {
  const controller = ToxenPlayer.useController();
  const clickOutsideRef: React.MutableRefObject<HTMLDivElement> = useClickOutside<HTMLDivElement>(() => controller.primaryPanelOpen && controller.setPrimaryPanelOpen(false)) as any;
  const ref = React.useRef<HTMLDivElement>(null);
  const { events } = useDraggable(ref as React.MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  });
  const isMobile = controller.playerWidth <= 768;

  const openPanel = React.useCallback(() => {
    controller.setPrimaryPanelOpen(true);
  }, []);

  const TabsList = (
    <Tabs.List
      justify={isMobile ? "apart" : "left"}
      className={
        "toxen-primary-panel-tabs-list"
      }
      orientation={isMobile ? "horizontal" : "vertical"}
    >
      <div
        style={{
          display: isMobile ? "none" : "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: "10px 0",
          cursor: "pointer",
          backgroundColor: controller.primaryPanelOpen ? ("ff0000" + "55") : ("00ff00" + "55"),
          transition: "background-color 0.2s ease-in-out",
          borderRadius: "50%",
        }}

        onClick={() => {
          controller.setPrimaryPanelOpen(!controller.primaryPanelOpen);
        }}
      >
        <IconX
          className="toxen-primary-panel-tabs-list__close-button"
          size={32}
        />
      </div>
      <div>
        <Tabs.Tab children={<IconMusic size={32} color={"green"} />} value="musiclist" onClick={openPanel} />
        <Tabs.Tab children={<IconSettings size={32} color={"green"} />} value="settings" onClick={openPanel} />
      </div>
    </Tabs.List>
  );

  return (
    <div
      ref={clickOutsideRef}
      className={
        "toxen-primary-panel"
        + (controller.primaryPanelOpen ? " toxen-primary-panel--open" : "")
      } style={{
        backgroundColor: controller.primaryPanelOpen ? "rgba(0, 0, 0, 0.5)" : undefined,
        opacity: !isMobile && controller.isIdling && !controller.primaryPanelOpen ? 0 : undefined,
      }}>
      <Tabs orientation={isMobile ? "vertical" : "horizontal"} defaultValue="musiclist" className="toxen-primary-panel-tabs">
        {!isMobile && TabsList}
        <div ref={ref} {...events} className={[
          "toxen-primary-panel-tabs-content",
          controller.primaryPanelOpen ? "toxen-primary-panel-tabs-content--active" : "",
        ].join(" ")}>
          <Tabs.Panel value="musiclist">
            <MusicList />
          </Tabs.Panel>
          <Tabs.Panel value="settings">
            <SettingsSection />
          </Tabs.Panel>
        </div>
        {isMobile && TabsList}
      </Tabs>
    </div>
  )
}
