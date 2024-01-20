import React from "react"

interface LabelProps {
  children: React.ReactNode
  for: string
}

export default function Label(props: LabelProps) {
  return (
    <label htmlFor={props.for}>Label</label>
  )
}

