import React from 'react'

const Variation = ({
  variations,
}: {
  variations: {
    id: string
    name: string
    type: 'SIZE' | 'WEIGHT' | 'COLOR'
  }[]
}) => {
  const variationStrings = variations?.map(
    (variation) =>
      `${variation.type.toUpperCase()?.slice(0, 1)}: ${variation.name}`
  )

  return (
    <span className="text-muted text-uppercase">
      {variationStrings.join(' - ')}
    </span>
  )
}

export default Variation
