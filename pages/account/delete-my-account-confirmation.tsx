import React, { useEffect } from 'react'
import apiHook from '../../api'
import { useForm } from 'react-hook-form'
import { inputText } from '../../utils/dForms'
import { Message } from '../../components'
import { useRouter } from 'next/router'

export default function DeleteMyAccount() {
  const router = useRouter()
  const _id = router.query?.id as string

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const deleteConfirm = apiHook({
    key: ['profiles'],
    method: 'POST',
    url: `mobile/profile/confirm-delete-account`,
  })?.post

  const submitHandler = (data: { otp?: string }) => {
    deleteConfirm?.mutateAsync({
      otp: data?.otp,
      _id,
    })
  }

  useEffect(() => {
    if (deleteConfirm?.isSuccess) {
      reset()
    }
  }, [deleteConfirm?.isSuccess])

  return (
    <div className="container col-sm-11 col-md-10 col-lg-6">
      {deleteConfirm?.isError && (
        <Message variant="danger" value={deleteConfirm?.error} />
      )}
      {deleteConfirm?.isSuccess && (
        <Message variant="success" value="Account deleted successfully" />
      )}

      {deleteConfirm?.isSuccess ? (
        <div className="alert alert-success p-5">
          <h4 className="alert-heading">Success!</h4>
          <p className="mb-0">Account deleted successfully</p>

          <p className="mb-0">
            We will review your confirm and delete your account in 24 hours.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="mb-5 border p-4"
        >
          <div className="mb-3">
            {inputText({
              register,
              errors,
              label: 'OTP',
              name: 'otp',
              placeholder: 'Enter your otp',
            } as any)}
            <div id="mobileHelp" className="form-text">
              We will review your confirm and delete your account in 24 hours.
            </div>
          </div>
          <button
            disabled={deleteConfirm?.isLoading}
            type="submit"
            className="btn btn-primary"
          >
            {deleteConfirm?.isLoading ? 'loading...' : 'Confirm'}
          </button>
        </form>
      )}
    </div>
  )
}
