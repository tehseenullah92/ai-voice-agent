"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  const isSm = size === "sm"

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "group/switch peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive",
        isSm ? "h-[18px] w-[32px]" : "h-[22px] w-[42px]",
        "border-white/25 bg-zinc-600 dark:bg-zinc-700",
        "data-[checked]:border-primary/50 data-[checked]:bg-primary",
        "data-[unchecked]:bg-zinc-600 dark:data-[unchecked]:bg-zinc-700",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow transition-transform duration-200 ease-out dark:bg-zinc-100",
          isSm
            ? "size-3 translate-x-0.5 group-data-[checked]/switch:translate-x-[14px]"
            : "size-[18px] translate-x-0.5 group-data-[checked]/switch:translate-x-[18px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
