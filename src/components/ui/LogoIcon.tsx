interface LogoIconProps {
  size?: number
}

export function LogoIcon({ size = 24 }: LogoIconProps) {
  const iconSize = Math.round(size * 0.5)
  return (
    <div
      style={{ width: size, height: size }}
      className="bg-black rounded-md flex items-center justify-center flex-shrink-0"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2" fill="white" stroke="none" />
      </svg>
    </div>
  )
}
