import axios from 'axios'

export default function amtel() {
  const url =
    'https://topup.amtelevc.com:3000/payment/services/SYNCAPIRequestMgrService'

  const jsonData = {
    'soapenv:Envelope': {
      '@xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
      '@xmlns:api': 'http://cps.huawei.com/synccpsinterface/api_requestmgr',
      '@xmlns:req': 'http://cps.huawei.com/synccpsinterface/request',
      '@xmlns:com': 'http://cps.huawei.com/synccpsinterface/common',
      '@xmlns:cus': 'http://cps.huawei.com/cpsinterface/customizedrequest',
      'soapenv:Header': {},
      'soapenv:Body': {
        'api:Request': {
          'req:Header': {
            'req:Version': '1.0',
            'req:CommandID': 'InitTrans_Airtime Recharge',
            'req:OriginatorConversationID': 'S_X2013012921001',
            'req:Caller': {
              'req:CallerType': '2',
              'req:ThirdPartyID': 'broker_ussdc',
              'req:Password':
                'Ps0gvuYgL5aZiJkaVyRGNoLkMnTXh+/9TeVs0GzTOgvCtCd0v05Orwg6v8NABOi90A854g==',
            },
            'req:KeyOwner': '1',
            'req:Timestamp': '20130402152345',
          },
          'req:Body': {
            'req:Identity': {
              'req:Initiator': {
                'req:IdentifierType': '11',
                'req:Identifier': '252716314913',
                'req:SecurityCredential':
                  'SoJAMVwOHHdLtPp73EIec/GT3sWnBHA41jIwChKPCJbpaCE1H96YEiY9zbaV',
                'req:ShortCode': '252716314913',
              },
              'req:ReceiverParty': {
                'req:IdentifierType': '4',
                'req:Identifier': '252710000310',
              },
            },
            'req:TransactionRequest': {
              'req:Parameters': {
                'req:Parameter': [
                  {
                    'com:Key': 'RechargedMSISDN',
                    'com:Value': '710000010',
                  },
                ],
              },
              'req:Amount': '0.25',
              'req:Currency': 'USD',
            },
            'req:ReferenceData': {
              'req:ReferenceItem': {
                'com:Key': 'POSDeviceID',
                'com:Value': 'POS234789',
              },
            },
          },
        },
      },
    },
  }

  return axios
    .post(url, jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      // Handle the response
      console.log(response.data)
    })
    .catch((error) => {
      // Handle the error
      console.error(error)
    })
}
