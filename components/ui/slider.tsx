import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  return (
    <SliderPrimitive.Root
      className={cn("relative w-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className={cn(
          "relative flex w-full touch-none items-center select-none",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          "data-disabled:opacity-50"
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative h-2.5 min-h-2.5 w-full grow overflow-hidden rounded-full",
            "border border-white/20 bg-zinc-700/95 shadow-inner dark:bg-zinc-800",
            "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:min-w-2.5"
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="h-full min-h-0 rounded-l-full bg-primary data-[orientation=vertical]:h-auto data-[orientation=vertical]:min-h-0 data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "relative z-10 block size-4 shrink-0 cursor-grab rounded-full border-2 border-background bg-primary shadow-md active:cursor-grabbing",
              "ring-2 ring-primary/40 transition-[box-shadow,transform] hover:ring-primary/60",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
              "active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
