import axios from 'axios'
import https from 'https'

interface IRequest {
  callerThirdPartyId?: string
  callerPassword?: string
  amtelUsername?: string
  amtelPassword?: string
  amtelShortCode?: string
  amtelIdentity?: string
  customerNumber: string
  offerAmount: number
  offerId: number
}

const soap = ({
  callerThirdPartyId,
  callerPassword,
  amtelUsername,
  amtelPassword,
  amtelShortCode,
  amtelIdentity,
  customerNumber,
  offerAmount,
  offerId,
}: IRequest): string => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:api="http://cps.huawei.com/synccpsinterface/api_requestmgr" 
  xmlns:req="http://cps.huawei.com/synccpsinterface/request" 
  xmlns:com="http://cps.huawei.com/synccpsinterface/common" 
  xmlns:cus="http://cps.huawei.com/cpsinterface/customizedrequest">
      <soapenv:Header/>
      <soapenv:Body>
          <api:Request>
  
              <req:Header>
                  <req:Version>1.0</req:Version>
                  <req:CommandID>InitTrans_EVCBuyBundle</req:CommandID>
                  <req:OriginatorConversationID>S_X2013012921001</req:OriginatorConversationID>
                  <req:Caller>
                      <req:CallerType>2</req:CallerType>
                      <req:ThirdPartyID>${callerThirdPartyId}</req:ThirdPartyID>
                      <req:Password>${callerPassword}</req:Password>
                  </req:Caller>
                  <req:KeyOwner>1</req:KeyOwner>
                  <req:Timestamp>20150101010101</req:Timestamp>
              </req:Header>
  
              <req:Body>
                  <req:Identity>
                      <req:Initiator>
                          <req:IdentifierType>11</req:IdentifierType>
                          <req:Identifier>${amtelUsername}</req:Identifier>
                          <req:SecurityCredential>${amtelPassword}</req:SecurityCredential>
                          <req:ShortCode>${amtelShortCode}</req:ShortCode>
                      </req:Initiator>
                      <req:ReceiverParty>
                          <req:IdentifierType>4</req:IdentifierType>
                          <req:Identifier>${amtelIdentity}</req:Identifier>
                      </req:ReceiverParty>
                  </req:Identity>
                  <req:TransactionRequest>
                      <req:Parameters>
                          <req:Parameter>
                              <com:Key>RechargedMSISDN</com:Key>
                              <com:Value>${customerNumber}</com:Value>
                          </req:Parameter>
                          <req:Amount>${offerAmount}</req:Amount> 
                          <req:Currency>USD</req:Currency>
                      </req:Parameters>
                  </req:TransactionRequest>
                  <req:ReferenceData>
                      <!--1 or more repetitions:-->
                      <req:ReferenceItem>
                          <com:Key>OfferingId</com:Key>
                          <com:Value>${offerId}</com:Value>
                      </req:ReferenceItem>
                  </req:ReferenceData>
                  <req:Remark>1212</req:Remark>
              </req:Body>
  
          </api:Request>
      </soapenv:Body>
  </soapenv:Envelope>`
}

export const useAmtelRecharge = async ({
  customerNumber,
  offerId,
  offerAmount,
}: {
  customerNumber: string
  offerId: number
  offerAmount: number
}) => {
  const {
    AMTEL_URL,
    AMTEL_CALLER_THIRD_PARTY_ID,
    AMTEL_CALLER_PASSWORD,
    AMTEL_USERNAME,
    AMTEL_PASSWORD,
    AMTEL_SHORT_CODE,
    AMTEL_IDENTITY,
  } = process.env

  try {
    const soapRequest = soap({
      callerThirdPartyId: AMTEL_CALLER_THIRD_PARTY_ID,
      callerPassword: AMTEL_CALLER_PASSWORD,
      amtelUsername: AMTEL_USERNAME,
      amtelPassword: AMTEL_PASSWORD,
      amtelShortCode: AMTEL_SHORT_CODE,
      amtelIdentity: AMTEL_IDENTITY,
      customerNumber,
      offerAmount,
      offerId,
    })

    const agent = new https.Agent({
      // ca: fs.readFileSync('./72123a9ebb351fe1.pem'),
      rejectUnauthorized: false,
    })

    const { data } = await axios.post(`${AMTEL_URL}`, soapRequest, {
      headers: {
        'Content-Type': 'text/xml',
      },
      httpsAgent: agent,
    })

    if (!data) return { status: 'Error', message: 'Something went wrong!' }

    const message = data.match(/<res:ResultDesc>(.*?)<\/res:ResultDesc>/)[1]

    if (!message.includes('uccessfully')) return { status: 'Error', message }

    return { status: 'Success', message }
  } catch (error) {
    return { status: 'Error', message: error }
  }
}
