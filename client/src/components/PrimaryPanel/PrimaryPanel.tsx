import React from "react"
import ToxenPlayer from "../ToxenPlayer/ToxenPlayer";
import "./PrimaryPanel.scss";
import { useClickOutside, useResizeObserver, useViewportSize } from '@mantine/hooks';
import { Icon123, IconAccessible, IconAdjustments, IconMusic, IconSettings, IconUpload, IconX } from "@tabler/icons-react";
import MusicList from "../MusicList/MusicList";
import MusicUpload from "../MusicUpload/MusicUpload";
import { useDraggable } from "react-use-draggable-scroll";
import SettingsSection from "../SettingsSection/SettingsSection";
import Tabs from "../Tabs/Tabs";
import ToxenApi from "../../Api/ToxenApi";

export default function PrimaryPanel() {
  const controller = ToxenPlayer.useController();
  const clickOutsideRef: React.MutableRefObject<HTMLDivElement> = useClickOutside<HTMLDivElement>(() => controller.primaryPanelOpen && controller.setPrimaryPanelOpen(false)) as any;
  const ref = React.useRef<HTMLDivElement>(null);
  const { events } = useDraggable(ref as React.MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  });
  const isMobile = controller.playerWidth <= 768;
  
  // State to refresh music list
  const [refreshKey, setRefreshKey] = React.useState(0);

  const openPanel = React.useCallback(() => {
    controller.setPrimaryPanelOpen(true);
  }, []);

  const handleUploadComplete = React.useCallback(async () => {
    try {
      // Refresh the track list
      const tracks = await ToxenApi.getTracks();
      controller.setTrackList(tracks);
      // Force re-render of MusicList component
      setRefreshKey(prev => prev + 1);
      // Switch back to music list tab
      // You could also keep the upload tab open if preferred
    } catch (error) {
      console.error("Failed to refresh track list after upload:", error);
    }
  }, [controller]);

  const togglePanel = React.useCallback(() => {
    controller.setPrimaryPanelOpen(!controller.primaryPanelOpen);
  }, [controller]);

  const tabsListContainerStyle = React.useMemo(() => ({
    display: isMobile ? "initial" : "flex",
    flexDirection: (isMobile ? "row" : "column") as React.CSSProperties['flexDirection'],
  }), [isMobile]);

  const closeButtonStyle = React.useMemo(() => ({
    display: isMobile ? "none" : "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "10px 0",
    cursor: "pointer",
    backgroundColor: controller.primaryPanelOpen ? ("ff0000" + "55") : ("00ff00" + "55"),
    transition: "background-color 0.2s ease-in-out",
    borderRadius: "50%",
  }), [isMobile, controller.primaryPanelOpen]);

  const TabsList = React.useMemo(() => (
    <div style={tabsListContainerStyle}>
      <div
        style={closeButtonStyle}
        onClick={togglePanel}
      >
        <IconX
          className="toxen-primary-panel-tabs-list__close-button"
          size={32}
        />
      </div>
      <Tabs.List
        justify={isMobile ? "apart" : "left"}
        className="toxen-primary-panel-tabs-list"
        orientation={isMobile ? "horizontal" : "vertical"}
      >
        <Tabs.Tab children={<IconMusic size={32} color={"green"} />} value="musiclist" onClick={openPanel} />
        <Tabs.Tab children={<IconUpload size={32} color={"green"} />} value="upload" onClick={openPanel} />
        <Tabs.Tab children={<IconAdjustments size={32} color={"green"} />} value="adjustments" onClick={openPanel} />
        <Tabs.Tab children={<IconAccessible size={32} color={"green"} />} value="accessible" onClick={openPanel} />
        <Tabs.Tab children={<IconSettings size={32} color={"green"} />} value="settings" onClick={openPanel} />
      </Tabs.List>
    </div>
  ), [tabsListContainerStyle, closeButtonStyle, togglePanel, isMobile, openPanel]);

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
            <MusicList key={refreshKey} />
          </Tabs.Panel>
          <Tabs.Panel value="upload">
            <MusicUpload onUploadComplete={handleUploadComplete} />
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
