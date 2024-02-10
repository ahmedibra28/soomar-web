import React, { useState, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { Spinner, Pagination, Message, Search, Meta } from '../../components'
import apiHook from '../../api'
import moment from 'moment'
import { currency } from '../../utils/currency'
import { IOrder } from '../../models/Order'
import { FaInfoCircle } from 'react-icons/fa'
import ModalView from '../../components/ModalView'
import Variation from '../../components/Variation'
import Image from 'next/image'

const Order = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [productDetails, setProductDetails] = useState<any>(null)

  const getApi = apiHook({
    key: ['orders'],
    method: 'GET',
    url: `reports/orders?page=${page}&q=${q}&limit=${50}`,
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

  const name = 'Order List'

  const content = (
    <div className="table-responsive bg-light p-3 mt-2">
      <div className="row">
        <div className="col-lg-6 col-12 text-start">
          <table className="tables table-sm borderless">
            <tbody>
              <tr>
                <th className="text-end">ID</th>
                <td className="px-5">{productDetails?._id}</td>
              </tr>
              <tr>
                <th className="text-end">Customer</th>
                <td className="px-5">{productDetails?.user?.name}</td>
              </tr>
              <tr>
                <th className="text-end">Customer Mobile</th>
                <td className="px-5">{productDetails?.user?.mobile}</td>
              </tr>
              <tr>
                <th className="text-end">Payment Method</th>
                <td className="px-5">Online</td>
              </tr>
              <tr>
                <th className="text-end">Payment Mobile</th>
                <td className="px-5">
                  {productDetails?.deliveryAddress?.mobile}
                </td>
              </tr>
              <tr>
                <th className="text-end">Delivery Price</th>
                <td className="px-5">
                  {currency(
                    productDetails?.deliveryAddress?.deliveryPrice || 0
                  )}
                </td>
              </tr>
              <tr>
                <th className="text-end">Delivery Address</th>
                <td className="px-5">
                  {productDetails?.deliveryAddress?.address}
                </td>
              </tr>
              <tr>
                <th className="text-end">Delivery Street</th>
                <td className="px-5">
                  {productDetails?.deliveryAddress?.deliveryAddress}
                </td>
              </tr>
              <tr>
                <th className="text-end">Order Date</th>
                <td className="px-5">
                  {moment(productDetails?.createdAt).format('lll')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-lg-6 col-12 mx-auto text-center">
          <Image
            src={productDetails?.product?.image?.[0] || '/noimageavailable.png'}
            alt={productDetails?.product?.name}
            width={300}
            height={300}
            style={{ objectFit: 'cover' }}
            className="img-fluid"
          />
        </div>
      </div>

      <hr className="my-5" />

      <table className="table table-sm table-border">
        <thead className="border-0">
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Variation</th>
            <th>Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {productDetails?.products?.map((item: any, i: number) => (
            <tr key={i}>
              <td>{item?.product?.sku}</td>
              <td>{item?.product?.name}</td>
              <td>
                {item?.product?.variations?.length > 0 && (
                  <Variation variations={item.product?.variations} />
                )}
                {/* <Variation
                   item={{
                     color: item?.color,
                     size: item?.size,
                     weight: item?.weight,
                   }}
                 /> */}
              </td>
              <td>{item?.quantity}</td>
              <td>{currency(item?.quantity * item?.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4} className="text-end">
              Total
            </th>
            <th>
              {currency(
                productDetails?.products?.reduce(
                  (acc: any, cur: any) => acc + cur?.quantity * cur?.price,
                  0
                )
              )}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  )

  return (
    <>
      <Meta title="Order" />

      <ModalView
        modal="productDetailsModal"
        label="Product Details"
        modalSize="modal-xl"
        content={content}
      />

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
                <th>Source</th>
                <th>Customer</th>
                <th>Delivery Address</th>
                <th>Street</th>
                <th>Payment Mobile</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>DateTime</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item: IOrder, i: number) => (
                <tr key={i}>
                  <td>{item?.dealer ? 'Dankaab' : 'Soomar'}</td>
                  <td>{item?.user?.name}</td>
                  <td>{item?.deliveryAddress?.address}</td>
                  <td>{item?.deliveryAddress?.deliveryAddress}</td>
                  <td>{item?.deliveryAddress?.mobile}</td>
                  <td>
                    {item?.products?.reduce(
                      (acc, cur) => acc + cur?.quantity,
                      0
                    )}
                  </td>
                  <td>
                    {currency(
                      item?.products?.reduce(
                        (acc, cur) => acc + cur?.quantity * cur?.price,
                        0
                      ) + (item?.deliveryAddress?.deliveryPrice || 0)
                    )}
                  </td>
                  <td>{moment(item?.createdAt).format('lll')}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm rounded-0"
                      onClick={() => setProductDetails(item)}
                      data-bs-toggle="modal"
                      data-bs-target={`#productDetailsModal`}
                    >
                      <FaInfoCircle className="mb-1" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Order)), {
  ssr: false,
})
