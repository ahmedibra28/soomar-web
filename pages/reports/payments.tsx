import React, { useState, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { Spinner, Pagination, Message, Search, Meta } from '../../components'
import apiHook from '../../api'
import { IPayment } from '../../models/Payment'
import moment from 'moment'
import { currency, currencySLSH } from '../../utils/currency'

const Payment = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const getApi = apiHook({
    key: ['payment'],
    method: 'GET',
    url: `reports/payments?page=${page}&q=${q}&limit=${50}`,
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

  const name = 'Payment List'

  return (
    <>
      <Meta title="Payment" />

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
                <th>User</th>
                <th>Transaction</th>
                <th>Amount</th>
                <th>Sahal Status</th>
                <th>Soomar Status</th>
                <th>DateTime</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item: IPayment, i: number) => (
                <tr key={i}>
                  <td>{item?.user?.name}</td>
                  <td>{item?.transaction}</td>
                  <td>
                    {item?.currency === 'SLSH'
                      ? currencySLSH(item?.amount)
                      : currency(item?.amount)}
                  </td>
                  <td>
                    {item?.status?.stepOne === 'success' ? (
                      <span className="badge bg-success">
                        {item?.status?.stepOne}
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        {item?.status?.stepOne}
                      </span>
                    )}
                  </td>
                  <td>
                    {item?.status?.stepTwo === 'success' ? (
                      <span className="badge bg-success">
                        {item?.status?.stepTwo}
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        {item?.status?.stepTwo}
                      </span>
                    )}
                  </td>

                  <td>{moment(item?.createdAt).format('lll')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Payment)), {
  ssr: false,
})
