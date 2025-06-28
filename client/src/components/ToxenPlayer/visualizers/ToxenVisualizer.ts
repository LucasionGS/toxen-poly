/**
 * Complete visualizer implementations for ToxenPlayer
 * All visualizer styles from Toxen3, restructured and improved
 */

import { VisualizerRenderContext, VisualizerBarData, VisualizerOrbOptions } from '../types/VisualizerTypes';
import { VisualizerUtils } from '../utils/VisualizerUtils';
import { BaseVisualizer } from './BaseVisualizer';

export class ToxenVisualizer extends BaseVisualizer {

  /**
   * Bottom visualizer - bars from bottom of screen
   */
  protected renderBottom(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] * dimensions.unitHeight);
      
      const bar: VisualizerBarData = {
        x: i * dimensions.unitWidth,
        y: dimensions.height - barHeight,
        width: dimensions.unitWidth,
        height: barHeight,
        value: data[i],
        index: i
      };

      this.drawBar(ctx, bar, settings, time, undefined, {
        top: false,
        bottom: true
      });
    }
  }

  /**
   * Top visualizer - bars from top of screen
   */
  protected renderTop(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] * dimensions.unitHeight);
      
      const bar: VisualizerBarData = {
        x: i * dimensions.unitWidth,
        y: 0,
        width: dimensions.unitWidth,
        height: barHeight,
        value: data[i],
        index: i
      };

      this.drawBar(ctx, bar, settings, time, undefined, {
        top: true,
        bottom: false
      });
    }
  }

  /**
   * Top and Bottom visualizer - bars from both top and bottom
   */
  protected renderTopAndBottom(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] * dimensions.unitHeight);
      
      // Top bars
      const topBar: VisualizerBarData = {
        x: i * dimensions.unitWidth,
        y: 0,
        width: dimensions.unitWidth,
        height: barHeight,
        value: data[i],
        index: i
      };

      // Bottom bars
      const bottomBar: VisualizerBarData = {
        x: i * dimensions.unitWidth,
        y: dimensions.height - barHeight,
        width: dimensions.unitWidth,
        height: barHeight,
        value: data[i],
        index: i
      };

      this.drawBar(ctx, topBar, settings, time, undefined, {
        top: true,
        bottom: false
      });

      this.drawBar(ctx, bottomBar, settings, time, undefined, {
        top: false,
        bottom: true
      });
    }
  }

  /**
   * Sides visualizer - bars from left and right sides
   */
  protected renderSides(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    const unitHeight = dimensions.height / data.length;
    const maxWidth = dimensions.maxWidth;
    const unitBarWidth = maxWidth / data.length;
    
    for (let i = 0; i < data.length; i++) {
      let barWidth = (data[i] * unitBarWidth);
      barWidth += barWidth / 2;
      
      const barData = {
        y: i * unitHeight,
        height: unitHeight,
        width: barWidth,
        value: data[i],
        index: i
      };

      if (i % 2 === 0) {
        // Left side
        const leftBar: VisualizerBarData = {
          ...barData,
          x: 0,
        };
        this.drawBar(ctx, leftBar, settings, time);
      } else {
        // Right side
        const rightBar: VisualizerBarData = {
          ...barData,
          x: dimensions.width - barWidth,
        };
        this.drawBar(ctx, rightBar, settings, time);
      }
    }
  }

  /**
   * Center visualizer - bars centered vertically
   */
  protected renderCenter(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] * dimensions.unitHeight) * 2; // Double height for center effect
      
      const bar: VisualizerBarData = {
        x: i * dimensions.unitWidth,
        y: dimensions.centerY - (barHeight / 2),
        width: dimensions.unitWidth,
        height: barHeight,
        value: data[i],
        index: i
      };

      this.drawBar(ctx, bar, settings, time);
    }
  }

  /**
   * Singularity visualizer - circular rotating bars
   */
  protected renderSingularity(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number, withLogo: boolean) {
    const { ctx, settings } = context;
    const cycleIncrementer = VisualizerUtils.getCycleIncrementer(data.length);
    const unitBarWidth = (dimensions.width * 1.25 + dimensions.unitHeight) / data.length;
    let totalHeight = 0;

    for (let i = 0; i < data.length; i++) {
      const barHeight = data[i] * dimensions.unitHeight;
      totalHeight += barHeight;

      // Set up glow effect
      if (settings.glow) {
        VisualizerUtils.setBarShadowBlur(ctx, barHeight);
        ctx.shadowColor = settings.color;
      }

      // Set up rainbow colors
      if (settings.rainbow) {
        VisualizerUtils.setRainbow(
          ctx,
          dimensions.centerX,
          dimensions.centerY,
          unitBarWidth,
          barHeight,
          i,
          cycleIncrementer,
          time
        );
      } else {
        ctx.fillStyle = settings.color;
        ctx.strokeStyle = settings.color;
      }

      VisualizerUtils.useAlpha(ctx, settings.opacity, (ctx) => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, dimensions.centerX, dimensions.centerY);
        ctx.rotate((cycleIncrementer * i + (time / 20000)) * Math.PI);
        ctx.fillRect(-(unitBarWidth / 2), 0, unitBarWidth, barHeight);
        ctx.restore();
      });
    }

    // Draw logo if requested
    if (withLogo) {
      this.drawCenterLogo(ctx, dimensions, totalHeight / data.length * 1.5, settings);
    }
  }

  /**
   * Mirrored Singularity visualizer - half-circle rotating bars
   */
  protected renderMirroredSingularity(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number, withLogo: boolean) {
    const { ctx, settings } = context;
    const filteredData = data.filter(d => d > 0);
    const cycleIncrementer = VisualizerUtils.getCycleIncrementer(filteredData.length, false); // Half circle
    const unitBarWidth = (dimensions.width * 1.25 + dimensions.unitHeight) / filteredData.length;
    let totalHeight = 0;

    for (let i = 0; i < filteredData.length; i++) {
      const barHeight = filteredData[i] * dimensions.unitHeight;
      totalHeight += barHeight;

      // Set up glow effect
      if (settings.glow) {
        VisualizerUtils.setBarShadowBlur(ctx, barHeight);
        ctx.shadowColor = settings.color;
      }

      // Set up rainbow colors
      if (settings.rainbow) {
        VisualizerUtils.setRainbow(
          ctx,
          dimensions.centerX,
          dimensions.centerY,
          unitBarWidth,
          barHeight,
          i,
          cycleIncrementer,
          time
        );
      } else {
        ctx.fillStyle = settings.color;
        ctx.strokeStyle = settings.color;
      }

      VisualizerUtils.useAlpha(ctx, settings.opacity, (ctx) => {
        // Original rotation
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, dimensions.centerX, dimensions.centerY);
        ctx.rotate(((cycleIncrementer * (Math.PI / 180)) * i));
        ctx.fillRect(-(unitBarWidth / 2), 0, unitBarWidth, barHeight);
        ctx.restore();

        // Mirrored rotation
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, dimensions.centerX, dimensions.centerY);
        ctx.rotate(0 - ((cycleIncrementer * (Math.PI / 180)) * i));
        ctx.fillRect(-(unitBarWidth / 2), 0, unitBarWidth, barHeight);
        ctx.restore();
      });
    }

    // Draw logo if requested
    if (withLogo) {
      this.drawCenterLogo(ctx, dimensions, totalHeight / filteredData.length * 1.5, settings);
    }
  }

  /**
   * Waveform visualizer - smooth connected wave that looks like a real audio waveform
   */
  protected renderWaveform(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    const centerY = dimensions.centerY;
    const stepX = dimensions.width / (data.length - 1);
    
    // Create a smooth waveform by interpolating between points
    const wavePoints: { x: number; y: number }[] = [];
    
    // Generate wave points with some smoothing
    for (let i = 0; i < data.length; i++) {
      // Reduce the maximum amplitude to 25% of screen height instead of 40%
      const rawAmplitude = (data[i] / 255) * (dimensions.height * 0.25);
      
      // Apply smoothing by averaging with neighboring values
      let smoothedAmplitude = rawAmplitude;
      if (i > 0 && i < data.length - 1) {
        const prevAmplitude = (data[i - 1] / 255) * (dimensions.height * 0.25);
        const nextAmplitude = (data[i + 1] / 255) * (dimensions.height * 0.25);
        smoothedAmplitude = (prevAmplitude + rawAmplitude + nextAmplitude) / 3;
      }
      
      // Add subtle wave motion but reduce the intensity
      const x = i * stepX;
      const waveMotion = Math.sin(time * 0.001 + i * 0.15) * 3; // Reduced from 5 to 3
      const amplitude = smoothedAmplitude * Math.sin(i * 0.2 + time * 0.002); // Reduced frequency
      const y = centerY + waveMotion + amplitude;
      
      wavePoints.push({ x, y });
    }
    
    // Set up glow effect for the waveform
    if (settings.glow) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = settings.color;
    }
    
    // Set up colors
    if (settings.rainbow) {
      // For rainbow, we'll create a gradient along the waveform
      const gradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
      const steps = 6;
      for (let i = 0; i <= steps; i++) {
        const hue = (i / steps * 360 + time * 0.1) % 360;
        gradient.addColorStop(i / steps, `hsl(${hue}, 70%, 60%)`);
      }
      ctx.strokeStyle = gradient;
      ctx.fillStyle = gradient;
    } else {
      ctx.strokeStyle = settings.color;
      ctx.fillStyle = settings.color;
    }
    
    VisualizerUtils.useAlpha(ctx, settings.opacity, (ctx) => {
      ctx.save();
      
      // Draw the main waveform line with smooth curves
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Start the path
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      
      // Create smooth curves between points using quadratic curves
      for (let i = 1; i < wavePoints.length - 1; i++) {
        const current = wavePoints[i];
        const next = wavePoints[i + 1];
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        
        ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
      }
      
      // Complete the path to the last point
      const lastPoint = wavePoints[wavePoints.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      
      // Stroke the waveform line
      ctx.stroke();
      
      // Create a filled area under/over the waveform for more visual impact
      ctx.beginPath();
      ctx.moveTo(wavePoints[0].x, centerY);
      
      // Trace the top of the waveform
      ctx.lineTo(wavePoints[0].x, wavePoints[0].y);
      for (let i = 1; i < wavePoints.length - 1; i++) {
        const current = wavePoints[i];
        const next = wavePoints[i + 1];
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
      }
      ctx.lineTo(lastPoint.x, lastPoint.y);
      
      // Close the path back to center line
      ctx.lineTo(lastPoint.x, centerY);
      ctx.closePath();
      
      // Fill with a more transparent version
      const currentAlpha = ctx.globalAlpha;
      ctx.globalAlpha = currentAlpha * 0.3;
      ctx.fill();
      ctx.globalAlpha = currentAlpha;
      
      // Add some additional wave details for more authentic look
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      
      // Draw additional harmonic lines
      for (let h = 0; h < 2; h++) {
        const harmonicOffset = (h + 1) * 30; // Increased spacing from 20 to 30
        ctx.beginPath();
        ctx.moveTo(0, centerY + harmonicOffset);
        
        for (let i = 0; i < data.length; i++) {
          // Reduce harmonic amplitude further and add smoothing
          let rawAmplitude = (data[i] / 255) * 12 * (1 - h * 0.4); // Reduced from 15
          
          // Smooth harmonics as well
          if (i > 0 && i < data.length - 1) {
            const prevAmp = (data[i - 1] / 255) * 12 * (1 - h * 0.4);
            const nextAmp = (data[i + 1] / 255) * 12 * (1 - h * 0.4);
            rawAmplitude = (prevAmp + rawAmplitude + nextAmp) / 3;
          }
          
          const x = i * stepX;
          const y = centerY + harmonicOffset + rawAmplitude * Math.sin(i * 0.4 + time * 0.003 + h);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.globalAlpha = currentAlpha * 0.3 * (1 - h * 0.2); // Reduced opacity
        ctx.stroke();
        
        // Mirror below center
        ctx.beginPath();
        ctx.moveTo(0, centerY - harmonicOffset);
        
        for (let i = 0; i < data.length; i++) {
          let rawAmplitude = (data[i] / 255) * 12 * (1 - h * 0.4);
          
          if (i > 0 && i < data.length - 1) {
            const prevAmp = (data[i - 1] / 255) * 12 * (1 - h * 0.4);
            const nextAmp = (data[i + 1] / 255) * 12 * (1 - h * 0.4);
            rawAmplitude = (prevAmp + rawAmplitude + nextAmp) / 3;
          }
          
          const x = i * stepX;
          const y = centerY - harmonicOffset - rawAmplitude * Math.sin(i * 0.4 + time * 0.003 + h);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
      
      ctx.globalAlpha = currentAlpha;
      ctx.setLineDash([]);
      ctx.restore();
    });
  }

  /**
   * Orb visualizer - circular bar visualizer with radial lines
   */
  protected renderOrb(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    
    // Default orb options (can be made configurable later)
    const orbOptions: VisualizerOrbOptions = {
      x: 50, // Center X
      y: 50, // Center Y
      size: 0, // Auto size
      opaque: false
    };

    const centerX = orbOptions.x === 50 ? dimensions.centerX : (dimensions.width / 100 * orbOptions.x);
    const centerY = orbOptions.y === 50 ? dimensions.centerY : (dimensions.height / 100 * orbOptions.y);
    
    const radius = orbOptions.size > 0 ? 
      orbOptions.size + (orbOptions.size * (effects.dynamicLighting / 4)) :
      (Math.min(dimensions.centerX, dimensions.centerY) * 0.45) + (Math.min(dimensions.centerX, dimensions.centerY) * 0.2) * effects.dynamicLighting;

    const unitAngle = (2 * Math.PI) / data.length;
    const rotation = Math.PI / 2 + ((time / 20000) * Math.PI);
    let highest = 0;

    for (let i = 0; i < data.length; i++) {
      const barHeight = Math.max(1, data[i] * dimensions.unitHeight);
      if (barHeight > highest) highest = barHeight;

      const angle = i * unitAngle + rotation;
      const mirroredAngle = (-i - 1) * unitAngle + rotation;

      // Calculate positions
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      const mx1 = centerX + Math.cos(mirroredAngle) * radius;
      const my1 = centerY + Math.sin(mirroredAngle) * radius;
      const mx2 = centerX + Math.cos(mirroredAngle) * (radius + barHeight);
      const my2 = centerY + Math.sin(mirroredAngle) * (radius + barHeight);

      // Set up rainbow colors
      if (settings.rainbow) {
        ctx.strokeStyle = VisualizerUtils.getRainbowColor(i, VisualizerUtils.getCycleIncrementer(data.length), time);
      } else {
        ctx.strokeStyle = settings.color;
      }

      // Draw the bars as lines
      VisualizerUtils.useAlpha(ctx, settings.opacity, (ctx) => {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();

        // Mirrored bar
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(mx1, my1);
        ctx.lineTo(mx2, my2);
        ctx.stroke();
        ctx.restore();
      });
    }

    // Draw opaque center if enabled
    if (orbOptions.opaque) {
      VisualizerUtils.useShadow(ctx, { blur: highest, color: settings.color }, (ctx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.fillStyle = settings.color;
        ctx.fill();
        ctx.restore();
      });
    }
  }

  /**
   * Progress Bar visualizer - bars along the progress bar area
   */
  protected renderProgressBar(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    
    // Simplified progress bar visualization (can be enhanced to match actual progress bar position)
    const progressBarHeight = 100; // Approximate height for progress bar area
    const yPosition = dimensions.height - progressBarHeight;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] * dimensions.unitHeight);
      
      const bar: VisualizerBarData = {
        x: i * dimensions.unitWidth,
        y: yPosition - barHeight,
        width: dimensions.unitWidth,
        height: barHeight,
        value: data[i],
        index: i
      };

      this.drawBar(ctx, bar, settings, time, undefined, {
        top: false,
        bottom: true
      });
    }
  }

  /**
   * Circular Waveform visualizer - waveform wrapped around a circle
   */
  protected renderCircularWaveform(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    const { ctx, settings } = context;
    const centerX = dimensions.centerX;
    const centerY = dimensions.centerY;
    
    // Base radius for the circular waveform
    const baseRadius = Math.min(dimensions.centerX, dimensions.centerY) * 0.4;
    const maxAmplitude = Math.min(dimensions.centerX, dimensions.centerY) * 0.5; // Increased from 0.3 to 0.5
    
    // Create circular wave points with smoothing
    const wavePoints: { x: number; y: number; radius: number }[] = [];
    const angleStep = (2 * Math.PI) / data.length;
    
    // Generate circular wave points with improved smoothing
    for (let i = 0; i < data.length; i++) {
      // Increase amplitude and add randomization
      const rawAmplitude = (data[i] / 255) * maxAmplitude * (1.2 + Math.sin(time * 0.001 + i) * 0.3); // Amplify peaks
      
      // Apply circular smoothing that wraps around the array
      let smoothedAmplitude = rawAmplitude;
      const prevIndex = (i - 1 + data.length) % data.length; // Wrap around for circular
      const nextIndex = (i + 1) % data.length; // Wrap around for circular
      const prevAmplitude = (data[prevIndex] / 255) * maxAmplitude * (1.2 + Math.sin(time * 0.001 + prevIndex) * 0.3);
      const nextAmplitude = (data[nextIndex] / 255) * maxAmplitude * (1.2 + Math.sin(time * 0.001 + nextIndex) * 0.3);
      
      // Multi-pass smoothing for better results
      smoothedAmplitude = (prevAmplitude * 0.25 + rawAmplitude * 0.5 + nextAmplitude * 0.25);
      
      // Second pass of smoothing with wider range
      const prevIndex2 = (i - 2 + data.length) % data.length;
      const nextIndex2 = (i + 2) % data.length;
      const prevAmplitude2 = (data[prevIndex2] / 255) * maxAmplitude * (1.2 + Math.sin(time * 0.001 + prevIndex2) * 0.3);
      const nextAmplitude2 = (data[nextIndex2] / 255) * maxAmplitude * (1.2 + Math.sin(time * 0.001 + nextIndex2) * 0.3);
      smoothedAmplitude = (prevAmplitude2 * 0.1 + smoothedAmplitude * 0.8 + nextAmplitude2 * 0.1);
      
      // Add more randomized wave motion with varying frequencies
      const angle = i * angleStep + (time * 0.0008); // Slightly faster rotation
      const randomFreq1 = Math.sin(time * 0.003 + i * 0.2) * 8; // Reduced intensity
      const randomFreq2 = Math.cos(time * 0.004 + i * 0.15) * 4; // Reduced intensity  
      const randomFreq3 = Math.sin(time * 0.002 + i * 0.3) * 2; // Reduced intensity
      const waveMotion = randomFreq1 + randomFreq2 + randomFreq3;
      
      // Reduce random amplitude variations for smoother result
      const randomVariation = Math.sin(i * 0.7 + time * 0.005) * 3; // Reduced from 5
      const radius = baseRadius + smoothedAmplitude + waveMotion + randomVariation;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      wavePoints.push({ x, y, radius });
    }
    
    // Set up glow effect for the circular waveform
    if (settings.glow) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = settings.color;
    }
    
    // Set up colors
    if (settings.rainbow) {
      // Create a radial gradient for the circular waveform
      const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, baseRadius + maxAmplitude);
      const steps = 8;
      for (let i = 0; i <= steps; i++) {
        const hue = (i / steps * 360 + time * 0.15) % 360;
        gradient.addColorStop(i / steps, `hsl(${hue}, 75%, 65%)`);
      }
      ctx.strokeStyle = gradient;
      ctx.fillStyle = gradient;
    } else {
      ctx.strokeStyle = settings.color;
      ctx.fillStyle = settings.color;
    }
    
    VisualizerUtils.useAlpha(ctx, settings.opacity, (ctx) => {
      ctx.save();
      
      // Draw the main circular waveform with smooth curves
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Start the circular path
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      
      // Create smooth curves between points using quadratic curves
      for (let i = 1; i < wavePoints.length; i++) {
        const current = wavePoints[i];
        const next = wavePoints[(i + 1) % wavePoints.length]; // Wrap around to close the circle
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        
        ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
      }
      
      // Close the circular path
      const firstPoint = wavePoints[0];
      const lastPoint = wavePoints[wavePoints.length - 1];
      const closingControlX = (lastPoint.x + firstPoint.x) / 2;
      const closingControlY = (lastPoint.y + firstPoint.y) / 2;
      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, closingControlX, closingControlY);
      ctx.closePath();
      
      // Stroke the waveform outline
      ctx.stroke();
      
      // Create a filled circular area for visual impact
      ctx.beginPath();
      
      // Inner circle (base radius)
      ctx.arc(centerX, centerY, baseRadius * 0.8, 0, Math.PI * 2, false);
      
      // Outer waveform path
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      for (let i = 1; i < wavePoints.length; i++) {
        const current = wavePoints[i];
        const next = wavePoints[(i + 1) % wavePoints.length];
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
      }
      const fillFirstPoint = wavePoints[0];
      const fillLastPoint = wavePoints[wavePoints.length - 1];
      const fillControlX = (fillLastPoint.x + fillFirstPoint.x) / 2;
      const fillControlY = (fillLastPoint.y + fillFirstPoint.y) / 2;
      ctx.quadraticCurveTo(fillLastPoint.x, fillLastPoint.y, fillControlX, fillControlY);
      ctx.closePath();
      
      // Fill with transparency
      const currentAlpha = ctx.globalAlpha;
      ctx.globalAlpha = currentAlpha * 0.25;
      ctx.fill();
      ctx.globalAlpha = currentAlpha;
      
      // Add inner harmonic circles for depth
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 4]);
      
      for (let h = 1; h <= 2; h++) {
        const harmonicRadius = baseRadius * (0.5 + h * 0.2); // Adjusted spacing
        const harmonicPoints: { x: number; y: number }[] = [];
        
        for (let i = 0; i < data.length; i++) {
          // Increase harmonic amplitudes and add more randomization
          let rawAmplitude = (data[i] / 255) * (maxAmplitude * 0.4) * (1.5 - h * 0.3); // Increased amplitude
          
          // Add randomization to harmonics
          const harmonicVariation = Math.sin(time * 0.004 + i * 0.5 + h * 2) * 4; // Reduced
          rawAmplitude *= (1 + harmonicVariation * 0.15); // Reduced
          
          // Apply circular smoothing to harmonics as well
          const prevIndex = (i - 1 + data.length) % data.length;
          const nextIndex = (i + 1) % data.length;
          const prevAmp = (data[prevIndex] / 255) * (maxAmplitude * 0.4) * (1.5 - h * 0.3);
          const nextAmp = (data[nextIndex] / 255) * (maxAmplitude * 0.4) * (1.5 - h * 0.3);
          rawAmplitude = (prevAmp * 0.3 + rawAmplitude * 0.4 + nextAmp * 0.3);
          
          const angle = i * angleStep + (time * 0.001) + (h * 0.2); // Different rotation speeds
          
          // Reduced wave frequencies for smoother motion
          const harmonicWave1 = Math.sin(time * 0.0035 + i * 0.18 + h) * 4; // Reduced from 6
          const harmonicWave2 = Math.cos(time * 0.0025 + i * 0.22 + h * 1.5) * 2; // Reduced from 4
          const harmonicMotion = harmonicWave1 + harmonicWave2;
          
          // Reduce random variations for smoother harmonics
          const randomHarmonicVar = Math.sin(i * 0.9 + time * 0.006 + h) * 2; // Removed Math.random(), reduced amplitude
          const radius = harmonicRadius + rawAmplitude + harmonicMotion + randomHarmonicVar;
          
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          harmonicPoints.push({ x, y });
        }
        
        // Draw harmonic circle
        ctx.beginPath();
        ctx.moveTo(harmonicPoints[0].x, harmonicPoints[0].y);
        
        for (let i = 1; i < harmonicPoints.length; i++) {
          const current = harmonicPoints[i];
          const next = harmonicPoints[(i + 1) % harmonicPoints.length];
          const controlX = (current.x + next.x) / 2;
          const controlY = (current.y + next.y) / 2;
          ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
        }
        
        const harmonicFirstPoint = harmonicPoints[0];
        const harmonicLastPoint = harmonicPoints[harmonicPoints.length - 1];
        const harmonicControlX = (harmonicLastPoint.x + harmonicFirstPoint.x) / 2;
        const harmonicControlY = (harmonicLastPoint.y + harmonicFirstPoint.y) / 2;
        ctx.quadraticCurveTo(harmonicLastPoint.x, harmonicLastPoint.y, harmonicControlX, harmonicControlY);
        ctx.closePath();
        
        ctx.globalAlpha = currentAlpha * 0.4 * (1 - h * 0.2);
        ctx.stroke();
      }
      
      // Draw center reference point
      ctx.globalAlpha = currentAlpha * 0.6;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = currentAlpha;
      ctx.restore();
    });
  }

  /**
   * Draw center logo for Singularity visualizers
   */
  private drawCenterLogo(ctx: CanvasRenderingContext2D, dimensions: any, size: number, settings: any) {
    // For now, draw a simple circle as placeholder logo
    // In real implementation, this would draw the actual Toxen logo
    VisualizerUtils.useAlpha(ctx, settings.opacity, (ctx) => {
      ctx.save();
      ctx.fillStyle = settings.color;
      ctx.beginPath();
      ctx.arc(dimensions.centerX, dimensions.centerY, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
