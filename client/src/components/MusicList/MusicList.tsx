import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import ToxenPlayer from "../ToxenPlayer/ToxenPlayer";
import ToxenApi from "../../Api/ToxenApi";
import "./MusicList.scss";
import Button from "../Button/Button";
import { IconRefresh, IconMusic, IconPlayerPlay, IconPlayerPause, IconEdit, IconSearch, IconX } from "@tabler/icons-react";
import EditSongPanel from "../EditSongPanel/EditSongPanel";

// Intersection Observer hook for visibility detection
const useVisibility = (ref: React.RefObject<Element>, options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { rootMargin: '100px', ...options });
    
    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isVisible;
};

// Individual track item component that only renders when visible
const TrackItem = React.memo<{
  track: any;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onEdit: () => void;
}>(({ track, index, isCurrentTrack, isPlaying, onPlay, onEdit }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isVisible = useVisibility(itemRef);
  
  const handleEdit = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    onEdit();
  }, [onEdit]);

  return (
    <div
      ref={itemRef}
      className={`toxen-app-music-list__item ${isCurrentTrack ? 'toxen-app-music-list__item--current' : ''}`}
      onClick={onPlay}
      style={{ minHeight: '80px' }} // Reserve space even when not visible
    >
      {isVisible && (
        <>
          {track.backgroundPath && (
            <div
              className="toxen-app-music-list__item-background"
              style={{
                backgroundImage: `url('${track.backgroundPath}')`,
              }}
            />
          )}
          
          <div className="toxen-app-music-list__item-content">
            <div className="toxen-app-music-list__item-info">
              <div className="toxen-app-music-list__item-main">
                <span className="toxen-app-music-list__item-title">
                  {track.title}
                </span>
                <span className="toxen-app-music-list__item-artist">
                  {track.artist}
                </span>
              </div>
              
              <div className="toxen-app-music-list__item-meta">
                {track.data.album && (
                  <span className="toxen-app-music-list__item-album">
                    {track.data.album}
                  </span>
                )}
                {track.data.year && (
                  <span className="toxen-app-music-list__item-year">
                    {track.data.year}
                  </span>
                )}
              </div>
            </div>
            
            <div className="toxen-app-music-list__item-actions">
              <Button
                variant="subtle"
                onClick={handleEdit}
                className="toxen-app-music-list__item-edit"
              >
                <IconEdit size={16} />
              </Button>
              
              <div className="toxen-app-music-list__item-play">
                {isPlaying ? (
                  <IconPlayerPause size={20} />
                ) : (
                  <IconPlayerPlay size={20} />
                )}
              </div>
              <span className="toxen-app-music-list__item-index">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
          
          <div className="toxen-app-music-list__item-overlay" />
        </>
      )}
      
      {/* Show minimal placeholder when not visible but is current track */}
      {!isVisible && isCurrentTrack && (
        <div className="toxen-app-music-list__item-placeholder">
          <span>{track.title} - {track.artist}</span>
          <IconPlayerPlay size={16} />
        </div>
      )}
    </div>
  );
});

export default function MusicList() {
  const controller = ToxenPlayer.useController();
  const current = controller.track;
  const [refreshing, setRefreshing] = React.useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tracks based on search term
  const filteredTracks = useMemo(() => {
    if (!searchTerm.trim()) {
      return controller.trackList;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return controller.trackList.filter(track => {
      return (
        track.title?.toLowerCase().includes(searchLower) ||
        track.artist?.toLowerCase().includes(searchLower) ||
        track.data?.album?.toLowerCase().includes(searchLower) ||
        track.data?.year?.toString().includes(searchLower)
      );
    });
  }, [controller.trackList, searchTerm]);

  const refreshTracks = useCallback(async () => {
    try {
      setRefreshing(true);
      const list = await ToxenApi.getTracks();
      controller.setTrackList(list);
      if (list.length > 0 && !controller.track) {
        controller.play(list.find(x => x.title.includes("ZELDA")) ?? list[0]);
      }
    } catch (error) {
      console.error("Failed to refresh tracks:", error);
    } finally {
      setRefreshing(false);
    }
  }, [controller]);

  React.useEffect(() => {
    refreshTracks();
  }, []);

  const handleEditTrack = useCallback((track: any) => {
    setEditingTrack(track);
  }, []);

  const handlePlayTrack = useCallback((track: any) => {
    controller.play(track);
  }, [controller]);

  const handleSaveTrack = useCallback(async (trackData: any) => {
    try {
      if (!editingTrack || !editingTrack.data.paths?.dirname) {
        throw new Error("Invalid track data");
      }

      // Save track data to backend
      await ToxenApi.updateTrack(editingTrack.data.paths.dirname, trackData);
      console.log('Track saved successfully:', trackData);
      
      // Refresh the track list to get the updated data
      await refreshTracks();
      setEditingTrack(null);
    } catch (error) {
      console.error("Failed to save track:", error);
      alert("Failed to save track changes. Please try again.");
    }
  }, [editingTrack, refreshTracks]);

  const handleCloseEdit = useCallback(() => {
    setEditingTrack(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="toxen-app-music-list">
      <div className="toxen-app-music-list__header">
        <div className="toxen-app-music-list__header-top">
          <div className="toxen-app-music-list__title">
            <IconMusic size={24} />
            <h3>Music Library</h3>
            <span className="toxen-app-music-list__count">
              {searchTerm ? `${filteredTracks.length} of ${controller.trackList.length}` : controller.trackList.length} track{(searchTerm ? filteredTracks.length : controller.trackList.length) !== 1 ? 's' : ''}
            </span>
          </div>
          <Button
            variant="subtle"
            onClick={refreshTracks}
            className="toxen-app-music-list__refresh-btn"
            disabled={refreshing}
          >
            <IconRefresh 
              size={20} 
              className={refreshing ? "toxen-app-music-list__refresh-spinning" : ""} 
            />
          </Button>
        </div>
        <div className="toxen-app-music-list__actions">
          <div className="toxen-app-music-list__search">
            <div className="toxen-app-music-list__search-input">
              <IconSearch size={16} className="toxen-app-music-list__search-icon" />
              <input
                type="text"
                placeholder="Search music..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="toxen-app-music-list__search-field"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="toxen-app-music-list__search-clear"
                  title="Clear search"
                >
                  <IconX size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {controller.trackList.length === 0 ? (
        <div className="toxen-app-music-list__empty">
          <IconMusic size={48} />
          <h4>No music tracks found</h4>
          <p>Upload some music to get started!</p>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="toxen-app-music-list__empty">
          <IconSearch size={48} />
          <h4>No tracks match your search</h4>
          <p>Try a different search term or clear the search to see all tracks.</p>
          <Button variant="subtle" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="toxen-app-music-list__items">
          {filteredTracks.map((track, index) => {
            const isCurrentTrack = current === track;
            const isPlaying = isCurrentTrack && !controller.paused;
            // Use original index from trackList for display
            const originalIndex = controller.trackList.findIndex(t => t.uid === track.uid);
            
            return (
              <TrackItem
                key={track.uid}
                track={track}
                index={originalIndex}
                isCurrentTrack={isCurrentTrack}
                isPlaying={isPlaying}
                onPlay={() => handlePlayTrack(track)}
                onEdit={() => handleEditTrack(track)}
              />
            );
          })}
        </div>
      )}

      {/* Edit Song Panel - Rendered via portal to document.body */}
      {editingTrack && createPortal(
        <EditSongPanel
          track={editingTrack}
          onSave={handleSaveTrack}
          onClose={handleCloseEdit}
        />,
        document.body
      )}
    </div>
  )
};