/** Small original vector portraits; no external images or runtime asset requests. */
export function PetPortrait({ species }: { species: string }) {
  const cat = species === 'Cat';
  const rabbit = species === 'Rabbit';
  const bird = species === 'Bird';
  if (!['Dog', 'Cat', 'Rabbit', 'Bird'].includes(species))
    return (
      <svg viewBox="0 0 100 100" width="82" height="82" fill="currentColor" aria-hidden="true">
        <ellipse cx="50" cy="65" rx="22" ry="18" />
        <ellipse cx="25" cy="40" rx="9" ry="12" transform="rotate(-20 25 40)" />
        <ellipse cx="45" cy="29" rx="9" ry="12" />
        <ellipse cx="66" cy="31" rx="9" ry="12" />
        <ellipse cx="80" cy="47" rx="8" ry="11" transform="rotate(25 80 47)" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 100 100"
      width="82"
      height="82"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {rabbit ? (
        <>
          <ellipse cx="36" cy="27" rx="9" ry="23" fill="#fffaf7" transform="rotate(-12 36 27)" />
          <ellipse cx="62" cy="25" rx="9" ry="23" fill="#fffaf7" transform="rotate(12 62 25)" />
          <path d="M34 13 39 40M65 11 60 38" stroke="#e5a38d" strokeWidth="4" />
        </>
      ) : cat ? (
        <path d="m23 49-2-30 24 17m10 0 24-17-2 30" fill="#d9b1c1" />
      ) : bird ? (
        <path d="m44 33 2-16 9 11 10-9-1 18" fill="#ff997b" />
      ) : (
        <>
          <path d="M29 34C7 24 8 72 23 71l13-26M71 34c22-10 21 38 6 37L64 45" fill="#b9744d" />
        </>
      )}
      <path
        d="M22 55c0-18 11-27 28-27s28 9 28 27v12c0 17-13 24-28 24S22 84 22 67Z"
        fill={cat ? '#e6c7d3' : rabbit ? '#fffaf7' : bird ? '#f9d4bf' : '#f0be89'}
      />
      {!bird && <ellipse cx="50" cy="71" rx="19" ry="14" fill="#fff4e9" stroke="none" />}
      <path d="M33 56q4-5 8 0m18 0q4-5 8 0" />
      {bird ? (
        <path d="m42 65 8-7 8 7-8 10Z" fill="#ff7a4d" />
      ) : (
        <>
          <path d="m45 66 5 5 5-5Z" fill="currentColor" />
          <path d="M50 71v4m-8 0q8 9 16 0" />
        </>
      )}
      {cat && <path d="m30 68-15-3m15 9-15 2m55-8 15-3m-15 9 15 2" />}
      <circle cx="30" cy="65" r="4" fill="#e69783" stroke="none" />
      <circle cx="70" cy="65" r="4" fill="#e69783" stroke="none" />
    </svg>
  );
}
