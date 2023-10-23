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
  inputFile,
  inputText,
  staticInputSelect,
} from '../../utils/dForms'
import FormView from '../../components/FormView'
import { FaPenAlt, FaTrash } from 'react-icons/fa'
import apiHook from '../../api'
import { IInternetProvider } from '../../models/InternetProvider'
import { Markets } from '../../utils/Markets'

const Providers = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState<any>(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')
  const [file, setFile] = useState(null)
  const [fileLink, setFileLink] = useState(null)

  const getApi = apiHook({
    key: ['internet-providers'],
    method: 'GET',
    url: `internets/providers?page=${page}&q=${q}&limit=${50}`,
  })?.get

  const postApi = apiHook({
    key: ['internet-providers'],
    method: 'POST',
    url: `internets/providers`,
  })?.post

  const updateApi = apiHook({
    key: ['internet-providers'],
    method: 'PUT',
    url: `internets/providers`,
  })?.put

  const deleteApi = apiHook({
    key: ['internet-providers'],
    method: 'DELETE',
    url: `internets/providers`,
  })?.deleteObj

  const uploadApi = apiHook({
    key: ['upload'],
    method: 'POST',
    url: `upload?type=image`,
  })?.post

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

  const editHandler = (item: IInternetProvider) => {
    setId(item._id)
    setValue('name', item?.name)
    setValue('branch', item?.branch)
    setValue('status', item?.status)
    setEdit(true)
  }

  const deleteHandler = (id: any) => {
    confirmAlert(Confirm(() => deleteApi?.mutateAsync(id)))
  }

  const name = 'Internet Providers List'
  const label = 'Internet provider'
  const modal = 'internetProvider'

  // FormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
  }

  const submitHandler = (data: Omit<IInternetProvider, '_id'>) => {
    if (!file && !fileLink) {
      edit
        ? updateApi?.mutateAsync({
            _id: id,
            name: data?.name,
            branch: data?.branch,
            status: data?.status,
          })
        : postApi?.mutateAsync(data)
    } else {
      edit
        ? updateApi?.mutateAsync({
            _id: id,
            name: data?.name,
            branch: data?.branch,
            image: file && fileLink ? fileLink : null,
            status: data?.status,
          })
        : postApi?.mutateAsync({ ...data, image: fileLink })
    }
  }

  useEffect(() => {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      uploadApi?.mutateAsync(formData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  useEffect(() => {
    if (uploadApi?.isSuccess) {
      setFileLink(uploadApi?.data.filePaths?.[0]?.path)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadApi?.isSuccess])

  const form = [
    <div key={0} className="col-12">
      {inputText({
        register,
        errors,
        label: 'Name',
        name: 'name',
        placeholder: 'Enter name',
      } as DynamicFormProps)}
    </div>,

    <div key={3} className="col-12">
      {staticInputSelect({
        register,
        errors,
        label: 'Branch',
        name: 'branch',
        placeholder: 'Branch',
        data: Markets.filter((item) => item.internet)?.map((item) => ({
          name: item.name,
        })),
      } as DynamicFormProps)}
    </div>,

    <div key={1} className="col-12">
      {inputFile({
        register,
        errors,
        label: 'Image',
        name: 'image',
        setFile,
        isRequired: false,
        placeholder: 'Choose an image',
      } as DynamicFormProps)}
    </div>,

    <div key={2} className="col-12">
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
      <Meta title="Internet Providers" />

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
        isLoadingUpdate={updateApi?.isLoading || uploadApi?.isLoading}
        isLoadingPost={postApi?.isLoading || uploadApi?.isLoading}
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
                <th>Name</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item: IInternetProvider, i: number) => (
                <tr key={i}>
                  <td>{item?.name}</td>
                  <td>{item?.branch}</td>
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

export default dynamic(() => Promise.resolve(withAuth(Providers)), {
  ssr: false,
})
