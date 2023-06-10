import axios from 'axios'
import { Parser } from 'xml2js'

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

  const finalurl = `${INTERNET_SOMLINK_URL}/?Page=OfferPurchaseByCC&UserID=${msisdn}&OfferId=${offerid}`

  try {
    axios
      .get(finalurl, {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${INTERNET_SOMLINK_USERNAME}:${INTERNET_SOMLINK_PASSWORD}`
            ).toString('base64'),
        },
      })
      .then((response) => {
        const parser = new Parser()
        parser.parseString(response.data, (error, result) => {
          if (error) {
            return error
          } else {
            let { Status } = result.Result
            const { Reason } = result.Result

            Status = Status[0]['$'].value

            if (Status === 'Error')
              return Reason[0]['$'].value || 'Something went wrong!'

            return Status
          }
        })
      })
      .catch((error) => {
        return error
      })
  } catch (error) {
    return error
  }
}
