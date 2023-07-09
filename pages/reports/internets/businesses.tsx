import React, { useState, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { Spinner, Pagination, Message, Search, Meta } from '../../../components'
import apiHook from '../../../api'
import { IInternetTransaction } from '../../../models/InternetTransaction'
import moment from 'moment'
import { currency, currencySLSH } from '../../../utils/currency'

const Business = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const getApi = apiHook({
    key: ['businesses-internet'],
    method: 'GET',
    url: `reports/internets/businesses?page=${page}&q=${q}&limit=${50}`,
  })?.get

  useEffect(() => {
    getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!q) getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const searchHandler = (e: FormEvent) => {
    e.preventDefault()
    getApi?.refetch()
    setPage(1)
  }

  const name = 'Business List'

  return (
    <>
      <Meta title="Business" />

      <div className="ms-auto text-end">
        <Pagination data={getApi?.data} setPage={setPage} />
      </div>

      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant="danger" value={getApi?.error} />
      ) : (
        <div className="table-responsive bg-light p-3 mt-2">
          <div className="d-flex align-items-center flex-column mb-2">
            <h3 className="fw-light text-muted">
              {name}
              <sup className="fs-6"> [{getApi?.data?.total}] </sup>
            </h3>

            <div className="col-auto">
              <Search
                placeholder="Search by name"
                setQ={setQ}
                q={q}
                searchHandler={searchHandler}
              />
            </div>
          </div>
          <table className="table table-sm table-border">
            <thead className="border-0">
              <tr>
                <th>Business</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Provider</th>
                <th>Bundle</th>
                <th>Amount</th>
                <th>DateTime</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map(
                (item: IInternetTransaction, i: number) => (
                  <tr key={i}>
                    <td>{item?.business?.name}</td>
                    <td>{item?.senderMobile}</td>
                    <td>{item?.receiverMobile}</td>
                    <td>{item?.provider?.name}</td>
                    <td>{item?.bundle?.label}</td>
                    <td>
                      {item?.provider?.name === 'Somtel SL'
                        ? currencySLSH(item?.bundle?.amount)
                        : currency(item?.bundle?.amount)}
                    </td>
                    <td>{moment(item?.createdAt).format('lll')}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Business)), {
  ssr: false,
})
