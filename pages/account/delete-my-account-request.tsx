import React, { useEffect } from 'react'
import apiHook from '../../api'
import { useForm } from 'react-hook-form'
import { inputTel } from '../../utils/dForms'
import { Message } from '../../components'

export default function DeleteMyAccount() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const deleteRequest = apiHook({
    key: ['profiles'],
    method: 'POST',
    url: `mobile/profile/request-delete-account`,
  })?.post

  const submitHandler = (data: { mobile?: string }) => {
    deleteRequest?.mutateAsync({
      mobile: data?.mobile,
    })
  }

  useEffect(() => {
    if (deleteRequest?.isSuccess) {
      window.location.href = `/account/delete-my-account-confirmation?id=${deleteRequest?.data?._id}`
    }
  }, [deleteRequest?.isSuccess])

  return (
    <div className="container col-sm-11 col-md-10 col-lg-6">
      {deleteRequest?.isError && (
        <Message variant="danger" value={deleteRequest?.error} />
      )}
      {deleteRequest?.isSuccess && (
        <Message variant="success" value="OTP sent to your mobile" />
      )}

      <form onSubmit={handleSubmit(submitHandler)} className="mb-5 border p-4">
        <div className="mb-3">
          {inputTel({
            register,
            errors,
            label: 'Mobile',
            name: 'mobile',
            placeholder: 'Enter your mobile',
          } as any)}

          <div id="mobileHelp" className="form-text">
            We will send you an OTP to your mobile.
          </div>
        </div>
        <button
          disabled={deleteRequest?.isLoading}
          type="submit"
          className="btn btn-primary"
        >
          {deleteRequest?.isLoading ? 'loading...' : 'Send OTP'}
        </button>
      </form>
    </div>
  )
}
