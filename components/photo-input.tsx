'use client';
import { useState, useEffect, useRef, useId } from 'react';
import Image from 'next/image';
import { ImagePlus, Upload } from 'lucide-react';

export function PhotoInput() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  useEffect(() => {
    const form = input.current?.form;
    const reset = () => {
      setUrl('');
      setName('');
      setError('');
      setDragging(false);
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, []);

  function selectFile(file?: File) {
    if (
      file &&
      (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 5 * 1024 * 1024)
    ) {
      setError('Choose a JPEG, PNG or WebP image up to 5 MB.');
      setUrl('');
      setName('');
      if (input.current) input.current.value = '';
      return;
    }
    setError('');
    setName(file?.name || '');
    setUrl(file ? URL.createObjectURL(file) : '');
  }
  return (
    <div className="photo-picker">
      <div
        className={`photo-dropzone${dragging ? ' dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!input.current?.matches(':disabled')) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!input.current || input.current.matches(':disabled')) return;
          if (event.dataTransfer.files.length !== 1) {
            setError('Drop one photo at a time.');
            return;
          }
          const file = event.dataTransfer.files[0];
          const transfer = new DataTransfer();
          transfer.items.add(file);
          input.current.files = transfer.files;
          selectFile(file);
        }}
      >
        <ImagePlus size={28} aria-hidden="true" />
        <label htmlFor={id} className="photo-drop-label">
          Drag and drop a photo here
        </label>
        <p id={`${id}-help`}>or choose a file · JPEG, PNG or WebP · up to 5 MB</p>
        <div className="photo-file-select">
          <Upload size={16} aria-hidden="true" />
          <input
            ref={input}
            id={id}
            type="file"
            name="file"
            required
            accept="image/jpeg,image/png,image/webp"
            aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
            aria-invalid={!!error}
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
      {url && (
        <div className="photo-selected">
          <Image unoptimized width={80} height={80} src={url} alt="Selected photo preview" />
          <span>{name}</span>
        </div>
      )}
    </div>
  );
}
