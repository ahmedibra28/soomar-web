export const ProviderNumberValidation = (number: number) => {
  if (!number || number.toString().length !== 9)
    return {
      validRegistration: false,
      validOTP: false,
      validSender: false,
      validReceiver: false,
      validEVCReceiver: false,
      validProviderName: false,
    }

  const key = number.toString().substring(0, 2)

  const ProviderNumber = {
    hormuud: ['61', '77'],
    somnet: ['68'],
    golis: ['90'],
    telesom: ['63'],
    somtel: ['62'],
    somtelSL: ['65'],
    somtelPL: ['66'],
    somlink: ['64'],
    amtel: ['71'],
    soltelco: ['67'],
  }

  const {
    hormuud,
    somnet,
    golis,
    telesom,
    somtel,
    somlink,
    amtel,
    soltelco,
    somtelPL,
    somtelSL,
  } = ProviderNumber

  const validProviderName = () => {
    if (hormuud.includes(key)) return 'hormuud'
    if (somnet.includes(key)) return 'somnet'
    if (golis.includes(key)) return 'golis'
    if (telesom.includes(key)) return 'telesom'
    if (somtel.includes(key)) return 'somtel'
    if (somlink.includes(key)) return 'somlink'
    if (amtel.includes(key)) return 'amtel'
    if (soltelco.includes(key)) return 'soltelco'
    if (somtelPL.includes(key)) return 'somtelPL'
    if (somtelSL.includes(key)) return 'somtelSL'

    return false
  }

  const validRegistration = () => {
    const valid = [...hormuud, ...somnet, ...golis, ...telesom, ...soltelco]
    return valid.includes(key)
  }

  const validOTP = () => {
    const valid = [...hormuud, ...somnet, ...golis, ...telesom, ...soltelco]
    return valid.includes(key)
  }

  const validSender = () => {
    const valid = [...hormuud, ...somnet, ...golis, ...telesom, ...soltelco]
    return valid.includes(key)
  }

  const validEVCReceiver = () => {
    const valid = [...hormuud, ...somnet, ...golis, ...telesom, ...soltelco]
    return valid.includes(key)
  }

  const validReceiver = () => {
    const valid = [
      ...hormuud,
      ...somnet,
      ...somtel,
      ...somlink,
      ...somtelSL,
      ...amtel,
      ...somtelPL,
    ]
    return valid.includes(key)
  }

  return {
    validRegistration: validRegistration(),
    validOTP: validOTP(),
    validSender: validSender(),
    validReceiver: validReceiver(),
    validEVCReceiver: validEVCReceiver(),
    validProviderName: validProviderName(),
  }
}
