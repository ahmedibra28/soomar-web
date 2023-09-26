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
import { DynamicFormProps, inputText, inputTextArea } from '../../utils/dForms'
import FormView from '../../components/FormView'
import { FaPaperPlane, FaPenAlt, FaTrash } from 'react-icons/fa'
import moment from 'moment'
import apiHook from '../../api'
import { INotification } from '../../models/Notification'

const Notifications = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState<any>(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const getApi = apiHook({
    key: ['notifications'],
    method: 'GET',
    url: `notifications?page=${page}&q=${q}&limit=${25}`,
  })?.get

  const postApi = apiHook({
    key: ['notifications'],
    method: 'POST',
    url: `notifications`,
  })?.post

  const sendApi = apiHook({
    key: ['notifications'],
    method: 'POST',
    url: `notifications/send`,
  })?.post

  const updateApi = apiHook({
    key: ['notifications'],
    method: 'PUT',
    url: `notifications`,
  })?.put

  const deleteApi = apiHook({
    key: ['notifications'],
    method: 'DELETE',
    url: `notifications`,
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

  const editHandler = (item: INotification) => {
    setId(item._id)
    setValue('type', item?.type)
    setValue('title', item?.title)
    setValue('body', item?.body)
    setValue('screen', item?.data?.screen)
    setValue('image', item?.data?.image)
    setValue('_id', item?.data?.params?._id)
    setValue('name', item?.data?.params?.name)

    setEdit(true)
  }

  const deleteHandler = (id: any) => {
    confirmAlert(Confirm(() => deleteApi?.mutateAsync(id)))
  }

  const name = 'Notifications List'
  const label = 'Notification'
  const modal = 'notification'

  // FormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
  }

  const submitHandler = (data: any) => {
    const obj = {
      title: data?.title,
      data: {
        screen: data?.screen,
        image: data?.image,
        params: {
          _id: data?._id,
          name: data?.name,
        },
      },
      body: data?.body,
    }

    console.log(obj)

    edit
      ? updateApi?.mutateAsync({
          _id: id,
          ...obj,
          type: 'system',
        })
      : postApi?.mutateAsync({ ...obj, type: 'system' })
  }

  const form = [
    <div key={0} className="col-12">
      {inputText({
        register,
        errors,
        label: 'Title',
        name: 'title',
        placeholder: 'Enter title',
      } as DynamicFormProps)}
    </div>,
    <div key={1} className="col-12">
      {inputText({
        register,
        errors,
        label: 'Screen',
        name: 'screen',
        placeholder: 'Enter screen',
        isRequired: false,
      } as DynamicFormProps)}
    </div>,
    <div key={2} className="col-12">
      {inputText({
        register,
        errors,
        label: 'Image link',
        name: 'image',
        placeholder: 'Enter image link',
      } as DynamicFormProps)}
    </div>,
    <div key={3} className="col-12">
      {inputText({
        register,
        errors,
        label: 'Params ID',
        name: '_id',
        placeholder: 'Enter params ID',
        isRequired: false,
      } as DynamicFormProps)}
    </div>,
    <div key={4} className="col-12">
      {inputText({
        register,
        errors,
        label: 'Params name',
        name: 'name',
        placeholder: 'Enter params name',
        isRequired: false,
      } as DynamicFormProps)}
    </div>,
    <div key={5} className="col-12">
      {inputTextArea({
        register,
        errors,
        label: 'Body',
        name: 'body',
        placeholder: 'Enter body message',
      } as DynamicFormProps)}
    </div>,
  ]

  const modalSize = 'modal-md'

  return (
    <>
      <Meta title="Notifications" />

      {deleteApi?.isSuccess && (
        <Message
          variant="success"
          value={`${label} has been deleted successfully.`}
        />
      )}
      {deleteApi?.isError && (
        <Message variant="danger" value={deleteApi?.error} />
      )}
      {sendApi?.isError && <Message variant="danger" value={sendApi?.error} />}
      {sendApi?.isSuccess && (
        <Message variant="success" value={`${label} has sent successfully.`} />
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
                <th>Image</th>
                <th>Title</th>
                <th>Screen</th>
                <th>Body Message</th>
                <th>DateTime</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item: INotification, i: number) => (
                <tr key={i}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item?.data?.image}
                      alt={item.title}
                      className="rounded-pill img-fluid"
                      style={{
                        objectFit: 'cover',
                        width: '40px',
                        height: '40px',
                      }}
                    />
                  </td>
                  <td>{item?.title}</td>
                  <td>{item?.data?.screen}</td>
                  <td>{item?.body}</td>
                  <td>{moment(item?.createdAt).format('lll')}</td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-success btn-sm rounded-pill"
                        onClick={() => sendApi?.mutateAsync({ _id: item._id })}
                      >
                        <FaPaperPlane />
                      </button>
                      <button
                        className="btn btn-primary btn-sm rounded-pill mx-1"
                        onClick={() => editHandler(item)}
                        data-bs-toggle="modal"
                        data-bs-target={`#${modal}`}
                      >
                        <FaPenAlt />
                      </button>

                      <button
                        className="btn btn-danger btn-sm rounded-pill"
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

export default dynamic(() => Promise.resolve(withAuth(Notifications)), {
  ssr: false,
})
