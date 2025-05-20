const BlurredMagnifier = () => (
  <svg
    width={200}
    height={200}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      opacity: 0.07,
      filter: 'blur(28px)',
      pointerEvents: 'none',
      zIndex: 1,
    }}
    viewBox="0 0 200 200"
  >
    <circle cx="90" cy="90" r="70" fill="#8c7cf0" />
    <rect x="140" y="140" width="40" height="15" rx="7" fill="#8c7cf0" transform="rotate(45 160 147.5)" />
  </svg>
);

export default BlurredMagnifier; 
 