import axios from 'axios'

export const useSomLinkRecharge = async ({
  msisdn,
  offerid,
}: {
  msisdn: number
  offerid: number
}) => {
  const {
    INTERNET_SOMLINK_USERNAME,
    INTERNET_SOMLINK_PASSWORD,
    INTERNET_SOMLINK_URL,
  } = process.env

  const finalurl = `${INTERNET_SOMLINK_URL}/?Page=OfferPurchaseByCC&UserID=252${msisdn}&OfferId=${offerid}`

  try {
    const { data } = await axios.get(finalurl, {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${INTERNET_SOMLINK_USERNAME}:${INTERNET_SOMLINK_PASSWORD}`
          ).toString('base64'),
      },
    })

    const statusValue =
      data?.match(/<Status value="([^"]+)" \/>/)?.[1] || 'Error'
    const reasonValue =
      data?.match(/<Reason value="([^"]+)" \/>/)?.[1] || 'Something went wrong!'

    // console.log('statusValue', statusValue)
    // console.log('reasonValue', reasonValue)

    return { status: statusValue, message: reasonValue }
  } catch (error) {
    return { status: 'Error', message: error }
  }
}
