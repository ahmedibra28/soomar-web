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
    somtel: ['62', '65', '66'],
    somlink: ['64'],
    amtel: ['71'],
    soltelco: ['67'],
  }

  const { hormuud, somnet, golis, telesom, somtel, somlink, amtel, soltelco } =
    ProviderNumber

  const validProviderName = () => {
    if (hormuud.includes(key)) return 'hormuud'
    if (somnet.includes(key)) return 'somnet'
    if (golis.includes(key)) return 'golis'
    if (telesom.includes(key)) return 'telesom'
    if (somtel.includes(key)) return 'somtel'
    if (somlink.includes(key)) return 'somlink'
    if (amtel.includes(key)) return 'amtel'
    if (soltelco.includes(key)) return 'soltelco'

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
    const newSomtel = somtel.filter((item) => item !== '66')

    const valid = [...hormuud, ...somnet, ...newSomtel, ...somlink]
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
