import React from 'react'

const Variation = ({
  item,
}: {
  item: {
    color?: string
    size?: string
    weight?: string
  }
}) => {
  return (
    <small className="text-uppercase">
      {item?.color || item?.size || item?.weight ? (
        <small>
          {item?.color && `C: ${item?.color} `}
          {item?.size && `S: ${item?.size} `}
          {item?.weight && `W: ${item?.weight}`}
        </small>
      ) : (
        <small className="text-muted">No variation</small>
      )}
    </small>
  )
}

export default Variation
