import React, { useState, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import {
  Spinner,
  Pagination,
  Message,
  Confirm,
  Search,
  Meta,
} from '../../components'
import {
  DynamicFormProps,
  dynamicInputSelect,
  inputNumber,
  inputText,
  inputTextArea,
  staticInputSelect,
} from '../../utils/dForms'
import FormView from '../../components/FormView'
import { FaPenAlt, FaTrash } from 'react-icons/fa'
import apiHook from '../../api'
import { IBundle } from '../../models/Bundle'
import { IInternetCategory } from '../../models/InternetCategory'
import { currency } from '../../utils/currency'

const Categories = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState<any>(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const getCategories = apiHook({
    key: ['internet-bundle-category'],
    method: 'GET',
    url: `internets/categories?page=${page}&q=${q}&limit=${250}`,
  })?.get

  const getApi = apiHook({
    key: ['bundles'],
    method: 'GET',
    url: `internets/bundles?page=${page}&q=${q}&limit=${25}`,
  })?.get

  const postApi = apiHook({
    key: ['bundles'],
    method: 'POST',
    url: `internets/bundles`,
  })?.post

  const updateApi = apiHook({
    key: ['bundles'],
    method: 'PUT',
    url: `internets/bundles`,
  })?.put

  const deleteApi = apiHook({
    key: ['bundles'],
    method: 'DELETE',
    url: `internets/bundles`,
  })?.deleteObj

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({})

  useEffect(() => {
    if (postApi?.isSuccess || updateApi?.isSuccess || deleteApi?.isSuccess) {
      formCleanHandler()
      getApi?.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postApi?.isSuccess, updateApi?.isSuccess, deleteApi?.isSuccess])

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

  const editHandler = (item: IBundle) => {
    setId(item._id)
    setValue('internetCategory', item?.internetCategory?._id)
    setValue('quantity', item?.quantity)
    setValue('amount', item?.amount)
    setValue('label', item?.label)
    setValue('description', item?.description)
    setValue('status', item?.status)
    setEdit(true)
  }

  const deleteHandler = (id: any) => {
    confirmAlert(Confirm(() => deleteApi?.mutateAsync(id)))
  }

  const name = 'Bundle List'
  const label = 'Bundle'
  const modal = 'bundle'

  // FormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
  }

  const submitHandler = (data: Omit<IBundle, '_id'>) => {
    edit
      ? updateApi?.mutateAsync({
          _id: id,
          ...data,
        })
      : postApi?.mutateAsync(data)
  }

  const newCategory = getCategories?.data?.data
    ?.map((item: IInternetCategory) => ({
      ...item,
      name: `${item.internetProvider?.name} - ${item.name}`,
    }))
    ?.filter((item: IInternetCategory) => item?.status === 'active')

  const form = [
    <div key={0} className="col-md-6 col-12">
      {dynamicInputSelect({
        register,
        errors,
        label: 'Internet Category',
        name: 'internetCategory',
        placeholder: 'Select internet category',
        value: 'name',
        data: newCategory,
      } as DynamicFormProps)}
    </div>,
    <div key={1} className="col-md-6 col-12">
      {inputText({
        register,
        errors,
        label: 'Label',
        name: 'label',
        placeholder: 'Enter label',
      } as DynamicFormProps)}
    </div>,
    <div key={3} className="col-md-6 col-12">
      {inputNumber({
        register,
        errors,
        label: 'Amount',
        name: 'amount',
        placeholder: 'Enter amount',
      } as DynamicFormProps)}
    </div>,
    <div key={4} className="col-md-6 col-12">
      {inputNumber({
        register,
        errors,
        label: 'Quantity',
        name: 'quantity',
        placeholder: 'Enter quantity',
      } as DynamicFormProps)}
    </div>,

    <div key={6} className="col-12">
      {inputTextArea({
        register,
        errors,
        label: 'Description',
        name: 'description',
        isRequired: false,
        placeholder: 'Enter description',
      } as DynamicFormProps)}
    </div>,
    <div key={5} className="col-12">
      {staticInputSelect({
        register,
        errors,
        label: 'Status',
        name: 'status',
        placeholder: 'Status',
        data: [{ name: 'active' }, { name: 'inactive' }],
      } as DynamicFormProps)}
    </div>,
  ]

  const modalSize = 'modal-md'

  return (
    <>
      <Meta title="Internet Bundles" />

      {deleteApi?.isSuccess && (
        <Message
          variant="success"
          value={`${label} has been deleted successfully.`}
        />
      )}
      {deleteApi?.isError && (
        <Message variant="danger" value={deleteApi?.error} />
      )}
      {updateApi?.isSuccess && (
        <Message
          variant="success"
          value={`${label} has been updated successfully.`}
        />
      )}
      {updateApi?.isError && (
        <Message variant="danger" value={updateApi?.error} />
      )}
      {postApi?.isSuccess && (
        <Message
          variant="success"
          value={`${label} has been Created successfully.`}
        />
      )}
      {postApi?.isError && <Message variant="danger" value={postApi?.error} />}

      <div className="ms-auto text-end">
        <Pagination data={getApi?.data} setPage={setPage} />
      </div>

      <FormView
        edit={edit}
        formCleanHandler={formCleanHandler}
        form={form}
        isLoadingUpdate={updateApi?.isLoading}
        isLoadingPost={postApi?.isLoading}
        handleSubmit={handleSubmit}
        submitHandler={submitHandler}
        modal={modal}
        label={label}
        modalSize={modalSize}
      />

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
            <button
              className="btn btn-outline-primary btn-sm shadow my-2"
              data-bs-toggle="modal"
              data-bs-target={`#${modal}`}
            >
              Add New {label}
            </button>
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
                <th>Provider</th>
                <th>Category</th>
                <th>Label</th>
                <th>Amount</th>
                <th>Quantity</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item: IBundle, i: number) => (
                <tr key={i}>
                  <td>{item?.internetCategory?.internetProvider?.name}</td>
                  <td>{item?.internetCategory?.name}</td>
                  <td>{item?.label}</td>
                  <td>{currency(item?.amount)}</td>
                  <td>{item?.quantity}</td>
                  <td>{item?.description}</td>
                  <td>
                    {item?.status === 'active' ? (
                      <div className="badge bg-success">{item?.status}</div>
                    ) : (
                      <div className="badge bg-danger">{item?.status}</div>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-primary btn-sm rounded-pill"
                        onClick={() => editHandler(item)}
                        data-bs-toggle="modal"
                        data-bs-target={`#${modal}`}
                      >
                        <FaPenAlt />
                      </button>

                      <button
                        className="btn btn-danger btn-sm ms-1 rounded-pill"
                        onClick={() => deleteHandler(item._id)}
                        disabled={deleteApi?.isLoading}
                      >
                        {deleteApi?.isLoading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <span>
                            <FaTrash />
                          </span>
                        )}
                      </button>
                    </div>
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

export default dynamic(() => Promise.resolve(withAuth(Categories)), {
  ssr: false,
})
