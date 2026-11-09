import { Check, Copy, Download, NotebookPen, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clipPreview } from '@shared/clipboard';
import { relativeTime } from '@shared/time';
import type { ClipItem, ClipboardState } from '@shared/types/clipboard';
import { SmallButton } from '../toolkit/parts';
import { Tip } from '../../tooltip/Tip';

const invoke = window.orbit.invoke;

/** Looks again every couple of seconds while the tab is open (Orbit itself checks the clipboard). */
function useClipboard(): [ClipboardState | null, (next: ClipboardState) => void, number] {
  const [state, setState] = useState<ClipboardState | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    let live = true;
    const load = () =>
      void invoke('clipboard:state', {}).then((next) => {
        if (live) {
          setState(next);
          setNow(Date.now());
        }
      });
    load();
    const timer = setInterval(load, 1500);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);
  return [state, setState, now];
}

/**
 * orbit://notes/panel/clipboard: what you copied lately (48 hours, on this Mac only). Copy puts
 * an item back on the clipboard; Save turns text into a note, or a picture into a file.
 */
export function ClipboardView() {
  const [state, setState, now] = useClipboard();
  if (!state) return null;
  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="clipboard">
      <div className="flex shrink-0 items-center gap-2 px-3.5 pt-2 pb-2">
        <label className="flex flex-1 items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={state.enabled}
            onChange={(e) =>
              void invoke('clipboard:enable', { enabled: e.target.checked }).then(setState)
            }
            data-testid="clipboard-enable"
          />
          Remember what I copy
        </label>
        {state.items.length > 0 && (
          <SmallButton
            onClick={() => void invoke('clipboard:clear', {}).then(setState)}
            testId="clipboard-clear"
          >
            <Trash2 size={13} /> Clear All
          </SmallButton>
        )}
      </div>
      <p className="px-3.5 pb-2 text-[12px] text-[var(--note-muted)]">
        Kept on this Mac for 48 hours; nothing is synced. Passwords copied from a password manager
        are skipped.
      </p>
      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-2.5 pb-3">
        {state.items.map((item) => (
          <Item key={item.id} item={item} now={now} onChange={setState} />
        ))}
        {state.items.length === 0 && (
          <li
            className="px-2 py-6 text-center text-[13px] text-[var(--note-muted)]"
            data-testid="clipboard-empty"
          >
            {state.enabled
              ? 'Nothing yet. Copy some text, a link or an image.'
              : 'Switch it on to start remembering what you copy.'}
          </li>
        )}
      </ul>
    </div>
  );
}

function Item({
  item,
  now,
  onChange,
}: {
  item: ClipItem;
  now: number;
  onChange: (next: ClipboardState) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    void invoke('clipboard:copy', { id: item.id }).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  return (
    <li
      className="group rounded-[12px] border border-[var(--work-border)] bg-[var(--work-card)] p-2.5"
      data-testid="clipboard-item"
      data-kind={item.kind}
    >
      {item.kind === 'image' && item.preview ? (
        <img
          src={item.preview}
          alt="Copied image"
          className="max-h-28 max-w-full rounded-[8px] object-contain"
        />
      ) : (
        <p
          className="line-clamp-4 text-[13px] break-words whitespace-pre-wrap"
          title={item.text}
          data-testid="clipboard-text"
        >
          {item.kind === 'link' ? item.text : clipPreview(item.text, 400)}
        </p>
      )}
      <div className="mt-2 flex items-center gap-1">
        <span className="flex-1 text-[11.5px] text-[var(--note-muted)]">
          {relativeTime(item.createdAt, now)}
        </span>
        <Tip label={copied ? 'Copied' : 'Copy'}>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy"
            className="press flex h-7 items-center gap-1 rounded-[8px] px-2 text-[12px] hover:bg-[var(--note-hover)]"
            data-testid="clipboard-copy"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </Tip>
        <Tip label={item.kind === 'image' ? 'Save as image file' : 'Save to a note'}>
          <button
            type="button"
            onClick={() => void invoke('clipboard:save', { id: item.id })}
            aria-label={item.kind === 'image' ? 'Save image' : 'Save to note'}
            className="press flex h-7 items-center gap-1 rounded-[8px] px-2 text-[12px] hover:bg-[var(--note-hover)]"
            data-testid="clipboard-save"
          >
            {item.kind === 'image' ? <Download size={13} /> : <NotebookPen size={13} />} Save
          </button>
        </Tip>
        <Tip label="Remove">
          <button
            type="button"
            onClick={() => void invoke('clipboard:remove', { id: item.id }).then(onChange)}
            aria-label="Remove"
            className="press flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--note-muted)] hover:bg-[var(--note-hover)]"
            data-testid="clipboard-remove"
          >
            <X size={13} />
          </button>
        </Tip>
      </div>
    </li>
  );
}
