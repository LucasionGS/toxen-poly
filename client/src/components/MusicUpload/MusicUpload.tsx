import React, { useState } from "react";
import UploadApi, { UploadMusicRequest } from "../../Api/UploadApi";
import Button from "../Button/Button";
import "./MusicUpload.scss";
import { IconCloudUpload, IconMusic, IconPhoto, IconFileText, IconScoreboard } from "@tabler/icons-react";

interface MusicUploadProps {
  onUploadComplete?: () => void;
}

export default function MusicUpload({ onUploadComplete }: MusicUploadProps) {
  const [formData, setFormData] = useState<Partial<UploadMusicRequest>>({
    artist: "",
    title: "",
    album: "",
    year: undefined,
    language: "",
    tags: [],
    visualizerColor: ""
  });
  
  const [files, setFiles] = useState<{
    audio?: File;
    background?: File;
    subtitles?: File;
    storyboard?: File;
  }>({});
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileChange = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [type]: file || undefined
    }));
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: keyof typeof files) => {
    e.preventDefault();
    setDragOver(null);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileChange(type, droppedFiles[0]);
    }
  };

  const validateForm = (): boolean => {
    return !!(files.audio && formData.artist && formData.title);
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      setUploadStatus({
        type: 'error',
        message: "Please provide audio file, artist, and title"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus({ type: null, message: '' });
    
    try {
      const uploadData: UploadMusicRequest = {
        audio: files.audio!,
        background: files.background,
        subtitles: files.subtitles,
        storyboard: files.storyboard,
        artist: formData.artist!,
        title: formData.title!,
        album: formData.album,
        year: formData.year,
        language: formData.language,
        tags: formData.tags,
        visualizerColor: formData.visualizerColor
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await UploadApi.uploadMusic(uploadData);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: "Music uploaded successfully!"
        });
        
        // Reset form
        setFormData({
          artist: "",
          title: "",
          album: "",
          year: undefined,
          language: "",
          tags: [],
          visualizerColor: ""
        });
        setFiles({});
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setUploadStatus({ type: null, message: '' });
          setUploadProgress(0);
        }, 3000);
        
        onUploadComplete?.();
      } else {
        const error = await response.json();
        setUploadStatus({
          type: 'error',
          message: `Upload failed: ${error.error || "Unknown error"}`
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: 'error',
        message: "Upload failed: Network error"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpload();
  };

  const FileUploadArea = React.useCallback(({ type, icon: Icon, label, accept, file }: {
    type: keyof typeof files;
    icon: React.ComponentType<any>;
    label: string;
    accept: string;
    file?: File;
  }) => (
    <div
      className={`music-upload__file-area ${dragOver === type ? 'music-upload__file-area--drag-over' : ''} ${file ? 'music-upload__file-area--has-file' : ''}`}
      onDragOver={(e) => handleDragOver(e, type)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, type)}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)}
        style={{ display: 'none' }}
        id={`file-${type}`}
      />
      <label htmlFor={`file-${type}`} className="music-upload__file-label">
        <Icon size={32} />
        <span>{file ? file.name : label}</span>
        {file && (
          <Button
            variant="subtle"
            onClick={() => handleFileChange(type, null)}
          >
            Remove
          </Button>
        )}
      </label>
    </div>
  ), [dragOver]);

  const uploadHeaderStyle = React.useMemo(() => ({ 
    textAlign: "center" as const, 
    marginBottom: "20px" 
  }), []);

  const iconStyle = React.useMemo(() => ({ 
    marginRight: "8px" 
  }), []);

  const statusStyle = React.useMemo(() => ({
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    backgroundColor: uploadStatus.type === 'success' ? 'rgba(0, 170, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
    border: `1px solid ${uploadStatus.type === 'success' ? '#00aa00' : '#ff0000'}`,
    color: uploadStatus.type === 'success' ? '#00dd00' : '#ff4444',
    textAlign: "center" as const
  }), [uploadStatus.type]);

  const uploadButtonStyle = React.useMemo(() => ({ 
    marginTop: "20px" 
  }), []);

  const uploadingContainerStyle = React.useMemo(() => ({ 
    display: "flex", 
    alignItems: "center", 
    gap: "10px" 
  }), []);

  const progressBarContainerStyle = React.useMemo(() => ({
    width: "100px",
    height: "4px",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "2px",
    overflow: "hidden"
  }), []);

  const progressBarFillStyle = React.useMemo(() => ({
    width: `${uploadProgress}%`,
    height: "100%",
    backgroundColor: "#00aa00",
    transition: "width 0.2s ease"
  }), [uploadProgress]);

  return (
    <div className="music-upload">
      <h3 style={uploadHeaderStyle}>
        <IconCloudUpload size={24} style={iconStyle} />
        Upload Music
      </h3>
      
      {/* Upload Status */}
      {uploadStatus.type && (
        <div style={statusStyle}>
          {uploadStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="music-upload__form">
        {/* Required Files */}
        <div className="music-upload__section">
          <h4>Audio File *</h4>
          <FileUploadArea
            type="audio"
            icon={IconMusic}
            label="Drop audio file here or click to browse"
            accept="audio/*"
            file={files.audio}
          />
        </div>

        {/* Optional Files */}
        <div className="music-upload__section">
          <h4>Optional Files</h4>
          <FileUploadArea
            type="background"
            icon={IconPhoto}
            label="Background Image"
            accept="image/*"
            file={files.background}
          />
          <FileUploadArea
            type="subtitles"
            icon={IconFileText}
            label="Subtitles File"
            accept=".srt,.vtt,.lrc"
            file={files.subtitles}
          />
          <FileUploadArea
            type="storyboard"
            icon={IconScoreboard}
            label="Storyboard File"
            accept=".yaml,.yml"
            file={files.storyboard}
          />
        </div>

        {/* Metadata */}
        <div className="music-upload__section">
          <h4>Track Information</h4>
          <div className="music-upload__form-row">
            <input
              type="text"
              placeholder="Artist *"
              value={formData.artist}
              onChange={(e) => handleInputChange('artist', e.target.value)}
              required
              className="music-upload__input"
            />
            <input
              type="text"
              placeholder="Title *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="music-upload__input"
            />
          </div>
          <div className="music-upload__form-row">
            <input
              type="text"
              placeholder="Album"
              value={formData.album}
              onChange={(e) => handleInputChange('album', e.target.value)}
              className="music-upload__input"
            />
            <input
              type="number"
              placeholder="Year"
              value={formData.year || ""}
              onChange={(e) => handleInputChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
              className="music-upload__input"
            />
          </div>
          <div className="music-upload__form-row">
            <input
              type="text"
              placeholder="Language"
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="music-upload__input"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={formData.tags?.join(', ') || ""}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="music-upload__input"
            />
          </div>
          <input
            type="color"
            placeholder="Visualizer Color"
            value={formData.visualizerColor || "#ffffff"}
            onChange={(e) => handleInputChange('visualizerColor', e.target.value)}
            className="music-upload__color-input"
          />
        </div>

        <Button
          fullWidth
          onClick={handleUpload}
          style={uploadButtonStyle}
          disabled={uploading}
        >
          {uploading ? (
            <div style={uploadingContainerStyle}>
              <span>Uploading... {uploadProgress}%</span>
              <div style={progressBarContainerStyle}>
                <div style={progressBarFillStyle} />
              </div>
            </div>
          ) : "Upload Music"}
        </Button>
      </form>
    </div>
  );
}
