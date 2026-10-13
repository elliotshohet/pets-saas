'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
export function PhotoInput() {
  const [url, setUrl] = useState('');
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return (
    <>
      <label>
        Photo
        <input
          type="file"
          name="file"
          required
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setUrl(file ? URL.createObjectURL(file) : '');
          }}
        />
      </label>
      {url && (
        <Image
          unoptimized
          width={140}
          height={140}
          className="care-photo"
          src={url}
          alt="Selected photo preview"
        />
      )}
    </>
  );
}
