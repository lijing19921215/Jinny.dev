import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue } from 'motion/react';

export interface ItemTransform {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  z: number;
}

export interface ItemDef {
  id: string;
  name: string;
  thumb: string | null;
  thumbBg: string;
  base: Omit<ItemTransform, 'z'>;
  baseZ: number;
}

export type TransformMap = Record<string, ItemTransform>;

export interface EditCtx {
  editing: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  transforms: TransformMap;
  updateTransform: (id: string, patch: Partial<ItemTransform>) => void;
  stageRef: React.RefObject<HTMLDivElement | null>;
}

export const ItemContext = React.createContext<EditCtx | null>(null);

export function useItemCtx(): EditCtx {
  const ctx = React.useContext(ItemContext);
  if (!ctx) throw new Error('ItemContext missing');
  return ctx;
}

const HANDLE = 9;

type Dir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const DIRS: Dir[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

const DIR_STYLE: Record<Dir, React.CSSProperties> = {
  nw: { left: -HANDLE / 2, top: -HANDLE / 2, cursor: 'nwse-resize' },
  n: { left: '50%', top: -HANDLE / 2, transform: 'translateX(-50%)', cursor: 'ns-resize' },
  ne: { right: -HANDLE / 2, top: -HANDLE / 2, cursor: 'nesw-resize' },
  e: { right: -HANDLE / 2, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
  se: { right: -HANDLE / 2, bottom: -HANDLE / 2, cursor: 'nwse-resize' },
  s: { left: '50%', bottom: -HANDLE / 2, transform: 'translateX(-50%)', cursor: 'ns-resize' },
  sw: { left: -HANDLE / 2, bottom: -HANDLE / 2, cursor: 'nesw-resize' },
  w: { left: -HANDLE / 2, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }
};

interface EditableItemProps {
  id: string;
  base: ItemTransform;
  children: React.ReactElement;
  ariaLabel?: string;
}

export const EditableItem: React.FC<EditableItemProps> = ({
  id,
  base,
  children,
  ariaLabel
}) => {
  const ctx = useItemCtx();
  const { editing, selectedId, setSelectedId, transforms, updateTransform, stageRef } = ctx;
  const t = transforms[id] ?? base;
  const selected = selectedId === id;
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const movedRef = useRef(false);

  const onDragEnd = useCallback(() => {
    if (!movedRef.current) return;
    const stage = stageRef.current;
    const w = stage?.clientWidth ?? 1;
    const h = stage?.clientHeight ?? 1;
    updateTransform(id, {
      x: Math.min(96, Math.max(4, t.x + (dragX.get() / w) * 100)),
      y: Math.min(94, Math.max(6, t.y + (dragY.get() / h) * 100))
    });
    dragX.set(0);
    dragY.set(0);
    movedRef.current = false;
  }, [dragX, dragY, id, t.x, t.y, updateTransform, stageRef]);

  const startResize = useCallback(
    (e: React.PointerEvent, dir: Dir) => {
      e.stopPropagation();
      e.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const s = { ...t };

      const onMove = (ev: PointerEvent) => {
        const dxPct = ((ev.clientX - startX) / rect.width) * 100;
        const dyPct = ((ev.clientY - startY) / rect.height) * 100;
        let { x, y, w, h } = s;
        if (dir.includes('e')) w = Math.max(3, s.w + dxPct);
        if (dir.includes('s')) h = Math.max(3, s.h + dyPct);
        if (dir.includes('w')) {
          w = Math.max(3, s.w - dxPct);
          x = s.x + (s.w - w);
        }
        if (dir.includes('n')) {
          h = Math.max(3, s.h - dyPct);
          y = s.y + (s.h - h);
        }
        updateTransform(id, {
          x: Math.min(96, Math.max(4, x)),
          y: Math.min(94, Math.max(6, y)),
          w: Math.min(80, w),
          h: Math.min(92, h)
        });
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [t, id, updateTransform, stageRef]
  );

  const startRotate = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + ((t.x + t.w / 2) / 100) * rect.width;
      const cy = rect.top + ((t.y + t.h / 2) / 100) * rect.height;
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      const baseRotate = t.rotate;
      const onMove = (ev: PointerEvent) => {
        const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
        const next = baseRotate + (angle - startAngle);
        updateTransform(id, { rotate: Math.round(next) });
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [t, id, updateTransform, stageRef]
  );

  type AnyEl = React.ReactElement<Record<string, unknown>>;
  const el = children as AnyEl;
  const child = React.cloneElement(el, {
    style: {
      ...((el.props.style as React.CSSProperties | undefined) ?? {}),
      position: 'static',
      left: undefined,
      top: undefined,
      right: undefined,
      bottom: undefined,
      width: '100%',
      height: '100%',
      zIndex: undefined
    } as React.CSSProperties,
    className: String(el.props.className ?? '')
      .replace(/\babsolute\b/g, '')
      .replace(/\bz-\d+\b/g, '')
      .trim(),
    onClick: editing ? undefined : (el.props.onClick as React.MouseEventHandler | undefined),
    onMouseEnter: editing ? undefined : (el.props.onMouseEnter as React.MouseEventHandler | undefined),
    onMouseLeave: editing ? undefined : (el.props.onMouseLeave as React.MouseEventHandler | undefined)
  });

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${t.x}%`,
        top: `${t.y}%`,
        width: `${t.w}%`,
        height: `${t.h}%`,
        zIndex: editing ? (selected ? 60 : t.z) : t.z,
        x: dragX,
        y: dragY,
        rotate: t.rotate,
        touchAction: 'none'
      }}
      drag={editing}
      dragConstraints={stageRef}
      dragMomentum={false}
      dragElastic={0.03}
      onDragStart={() => { movedRef.current = true; }}
      onDragEnd={onDragEnd}
      onPointerDown={() => { if (editing && !movedRef.current) setSelectedId(id); }}
      data-editable-item={id}
      aria-label={ariaLabel}
    >
      {child}

      {editing && selected && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 2 }}>
          <div className="absolute inset-0 rounded-[4px] border-2 border-[#1E63D6]" />
          {DIRS.map((dir) => (
            <span
              key={dir}
              className="pointer-events-auto absolute rounded-[2px] border border-[#1E63D6] bg-white"
              style={{ width: HANDLE, height: HANDLE, ...DIR_STYLE[dir] }}
              onPointerDown={(e) => startResize(e, dir)}
            />
          ))}
          <span
            className="pointer-events-auto absolute left-1/2 rounded-full border-2 border-[#1E63D6] bg-white"
            style={{ width: 14, height: 14, top: -22, transform: 'translateX(-50%)', cursor: 'grab' }}
            onPointerDown={startRotate}
            title="旋转"
          />
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap rounded bg-[#1E63D6] px-1.5 py-0.5 font-paper-mono text-[10px] text-white">
            {Math.round(t.rotate)}°
          </span>
        </div>
      )}
    </motion.div>
  );
};
