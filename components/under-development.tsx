"use client"

import CircularText from "./ui/shadcn-io/circular-text"



interface UnderDevelopmentProps {
  title: string
}

export function UnderDevelopment({ title }: UnderDevelopmentProps) {
  return (
   <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-background via-muted to-background">
      <div className="flex flex-col items-center space-y-12">
        <CircularText
          text="Under • Development • "
          onHover="speedUp"
          spinDuration={15}
          className="text-primary tracking-widest"
        />
      </div>
    </div>
  )
}
