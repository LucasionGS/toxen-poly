import React, { useState, useCallback, useRef, useEffect } from "react"
import ToxenPlayer from "../ToxenPlayer/ToxenPlayer";
import "./PrimaryPanel.scss";
import { useClickOutside } from '@mantine/hooks';
import { Icon123, IconAccessible, IconAdjustments, IconMusic, IconSettings, IconUpload, IconX, IconGripVertical } from "@tabler/icons-react";
import MusicList from "../MusicList/MusicList";
import MusicUpload from "../MusicUpload/MusicUpload";
import { useDraggable } from "react-use-draggable-scroll";
import SettingsSection from "../SettingsSection/SettingsSection";
import Tabs from "../Tabs/Tabs";
import ToxenApi from "../../Api/ToxenApi";

// Constants for panel width
const MIN_PANEL_WIDTH = 300;
const MAX_PANEL_WIDTH = 800;
const DEFAULT_PANEL_WIDTH = 450;
const STORAGE_KEY = 'primaryPanel_width';

// Type for scroll positions
type ScrollPositions = {
  musiclist: number;
  upload: number;
  settings: number;
};

export default function PrimaryPanel() {
  const controller = ToxenPlayer.useController();
  const clickOutsideRef: React.MutableRefObject<HTMLDivElement> = useClickOutside<HTMLDivElement>(() => controller.primaryPanelOpen && controller.setPrimaryPanelOpen(false)) as any;
  const ref = React.useRef<HTMLDivElement>(null);
  const { events } = useDraggable(ref as React.MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  });
  const isMobile = controller.playerWidth <= 768;
  
  // Panel width state with localStorage persistence
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_PANEL_WIDTH;
  });
  
  // Drag state for resizing
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  
  // State to refresh music list
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Scroll state preservation
  const [scrollPositions, setScrollPositions] = useState<ScrollPositions>(() => {
    const saved = localStorage.getItem('primaryPanel_scrollPositions');
    return saved ? JSON.parse(saved) : {
      musiclist: 0,
      upload: 0,
      settings: 0
    };
  });
  
  const [currentTab, setCurrentTab] = useState('musiclist');
  
  // Refs for each tab's scrollable content
  const musicListScrollRef = useRef<HTMLDivElement>(null);
  const uploadScrollRef = useRef<HTMLDivElement>(null);
  const settingsScrollRef = useRef<HTMLDivElement>(null);
  
  // Get the correct scroll ref based on tab name
  const getScrollRef = useCallback((tabName: string) => {
    switch (tabName) {
      case 'musiclist': return musicListScrollRef;
      case 'upload': return uploadScrollRef;
      case 'settings': return settingsScrollRef;
      default: return null;
    }
  }, []);

  const openPanel = React.useCallback(() => {
    controller.setPrimaryPanelOpen(true);
  }, [controller]);

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

  // Save width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, panelWidth.toString());
  }, [panelWidth]);

  // Mouse event handlers for resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  // Touch event handlers for mobile resizing
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartX.current = touch.clientX;
    dragStartWidth.current = panelWidth;
  }, [panelWidth]);

  // Effect for handling mouse/touch move and up events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, dragStartWidth.current + deltaX));
      setPanelWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartX.current;
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, dragStartWidth.current + deltaX));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Save scroll position for current tab
  const saveScrollPosition = useCallback((tabName: string) => {
    const scrollRef = getScrollRef(tabName);
    if (scrollRef?.current && (tabName === 'musiclist' || tabName === 'upload' || tabName === 'settings')) {
      const scrollTop = scrollRef.current.scrollTop;
      setScrollPositions(prev => {
        const newPositions = { ...prev, [tabName]: scrollTop };
        localStorage.setItem('primaryPanel_scrollPositions', JSON.stringify(newPositions));
        return newPositions;
      });
    }
  }, [getScrollRef]);

  // Restore scroll position for a tab
  const restoreScrollPosition = useCallback((tabName: string) => {
    const scrollRef = getScrollRef(tabName);
    if (scrollRef?.current && (tabName === 'musiclist' || tabName === 'upload' || tabName === 'settings')) {
      const scrollTop = scrollPositions[tabName as keyof ScrollPositions];
      if (scrollTop !== undefined) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollTop;
          }
        }, 50);
      }
    }
  }, [getScrollRef, scrollPositions]);

  // Handle tab changes to save/restore scroll positions
  const handleTabChange = useCallback((tabValue: string) => {
    // Save current tab's scroll position before switching
    saveScrollPosition(currentTab);
    // Update current tab
    setCurrentTab(tabValue);
    // Restore new tab's scroll position (will happen in useEffect)
  }, [currentTab, saveScrollPosition]);

  // Add scroll event listeners to save positions during scrolling
  useEffect(() => {
    const currentScrollRef = getScrollRef(currentTab);
    if (!currentScrollRef?.current) return;

    const handleScroll = () => {
      saveScrollPosition(currentTab);
    };

    const scrollElement = currentScrollRef.current;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [currentTab, getScrollRef, saveScrollPosition]);

  // Save scroll position when panel closes or tab changes
  useEffect(() => {
    if (!controller.primaryPanelOpen) {
      saveScrollPosition(currentTab);
    }
  }, [controller.primaryPanelOpen, currentTab, saveScrollPosition]);

  // Restore scroll position when panel opens or tab changes
  useEffect(() => {
    if (controller.primaryPanelOpen) {
      restoreScrollPosition(currentTab);
    }
  }, [controller.primaryPanelOpen, currentTab, restoreScrollPosition]);

  return (
    <div
      ref={clickOutsideRef}
      className={
        "toxen-primary-panel"
        + (controller.primaryPanelOpen ? " toxen-primary-panel--open" : "")
      } 
      style={{
        backgroundColor: controller.primaryPanelOpen ? "rgba(0, 0, 0, 0.5)" : undefined,
        opacity: !isMobile && controller.isIdling && !controller.primaryPanelOpen ? 0 : undefined,
      }}
    >
      <Tabs 
        orientation={isMobile ? "vertical" : "horizontal"} 
        defaultValue="musiclist" 
        className="toxen-primary-panel-tabs"
        onChange={handleTabChange}
      >
        {!isMobile && TabsList}
        <div 
          ref={ref} 
          {...events} 
          className={[
            "toxen-primary-panel-tabs-content",
            controller.primaryPanelOpen ? "toxen-primary-panel-tabs-content--active" : "",
          ].join(" ")}
          style={{ 
            width: (controller.primaryPanelOpen || isMobile) ? (isMobile ? '100%' : `${panelWidth}px`) : '0px' 
          }}
        >
          {/* Resize handle - only show when panel is open and not on mobile */}
          {controller.primaryPanelOpen && !isMobile && (
            <div 
              className={`toxen-primary-panel__resize-handle ${isDragging ? 'toxen-primary-panel__resize-handle--dragging' : ''}`}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              title="Drag to resize panel"
              style={{
                left: `${panelWidth + 52}px` // Position at the right edge of the panel
              }}
            >
              <IconGripVertical size={16} />
              {isDragging && (
                <div className="toxen-primary-panel__width-indicator">
                  {panelWidth}px
                </div>
              )}
            </div>
          )}

          <Tabs.Panel value="musiclist">
            <div ref={musicListScrollRef} className="toxen-primary-panel__scrollable-content">
              <MusicList key={refreshKey} />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="upload">
            <div ref={uploadScrollRef} className="toxen-primary-panel__scrollable-content">
              <MusicUpload onUploadComplete={handleUploadComplete} />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="settings">
            <div ref={settingsScrollRef} className="toxen-primary-panel__scrollable-content">
              <SettingsSection />
            </div>
          </Tabs.Panel>
        </div>
        {isMobile && TabsList}
      </Tabs>
    </div>
  )
}
