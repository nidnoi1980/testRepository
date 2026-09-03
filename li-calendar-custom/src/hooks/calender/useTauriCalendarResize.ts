import { invoke } from '@tauri-apps/api/core';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { type RefObject, useLayoutEffect, useRef } from 'react';

const REPOSITION_NEAR_TASKBAR_MS = 150;

/**
 * 将日历根节点内容尺寸同步为当前 Tauri 窗口大小。
 *
 * Windows/WebView2 在系统 DPI、文本缩放或 WebView zoom 组合下，DOM CSS px 与
 * Tauri logical px 可能并非 1:1。这里通过窗口物理像素、DOM viewport CSS 像素、
 * Tauri scaleFactor 与 devicePixelRatio 共同反推出 WebView 的实际缩放倍数。
 */
export function useTauriCalendarResize(
  autoResizeWindow: boolean,
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const repositionTaskbarPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLogicalSizeRef = useRef<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (!autoResizeWindow) return;
    const el = containerRef.current;
    if (!el) return;

    const scheduleRepositionTaskbarPopup = (): void => {
      const appWindow = getCurrentWindow();
      if (appWindow.label !== 'calendar') return;
      if (repositionTaskbarPopupTimerRef.current != null) {
        clearTimeout(repositionTaskbarPopupTimerRef.current);
      }
      repositionTaskbarPopupTimerRef.current = setTimeout(() => {
        repositionTaskbarPopupTimerRef.current = null;
        requestAnimationFrame(() => {
          void invoke('show_calendar').catch(() => {});
        });
      }, REPOSITION_NEAR_TASKBAR_MS);
    };

    const resizeWindow = async (): Promise<void> => {
      const appWindow = getCurrentWindow();
      const tauriScale = await appWindow.scaleFactor();
      const innerPhysical = await appWindow.innerSize();

      const viewportCssWidth = Math.max(
        1,
        document.documentElement.clientWidth || window.innerWidth || 1,
      );
      const viewportCssHeight = Math.max(
        1,
        document.documentElement.clientHeight || window.innerHeight || 1,
      );

      const physicalPerCssX = innerPhysical.width / viewportCssWidth;
      const physicalPerCssY = innerPhysical.height / viewportCssHeight;
      const zoomFromViewportX = tauriScale > 0 ? physicalPerCssX / tauriScale : 1;
      const zoomFromViewportY = tauriScale > 0 ? physicalPerCssY / tauriScale : 1;
      const zoomFromDpr = tauriScale > 0 ? window.devicePixelRatio / tauriScale : 1;

      const webviewZoom = Math.min(
        3,
        Math.max(0.75, zoomFromViewportX, zoomFromViewportY, zoomFromDpr),
      );

      const rect = el.getBoundingClientRect();
      const contentCssWidth = Math.ceil(Math.max(rect.width, el.offsetWidth, el.scrollWidth));
      const contentCssHeight = Math.ceil(Math.max(rect.height, el.offsetHeight, el.scrollHeight));

      const logicalWidth = Math.ceil(contentCssWidth * webviewZoom) + 4;
      const logicalHeight = Math.ceil(contentCssHeight * webviewZoom) + 4;

      const previous = lastLogicalSizeRef.current;
      if (
        previous == null ||
        Math.abs(previous.width - logicalWidth) > 1 ||
        Math.abs(previous.height - logicalHeight) > 1
      ) {
        lastLogicalSizeRef.current = { width: logicalWidth, height: logicalHeight };
        await appWindow.setSize(new LogicalSize(logicalWidth, logicalHeight));
        scheduleRepositionTaskbarPopup();
      }
    };

    const observer = new ResizeObserver(() => {
      void resizeWindow().catch(() => {});
    });

    observer.observe(el);
    void resizeWindow().catch(() => {});

    return () => {
      observer.disconnect();
      if (repositionTaskbarPopupTimerRef.current != null) {
        clearTimeout(repositionTaskbarPopupTimerRef.current);
        repositionTaskbarPopupTimerRef.current = null;
      }
    };
  }, [autoResizeWindow]);

  return containerRef;
}
