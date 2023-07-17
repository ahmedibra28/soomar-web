import { FaTimesCircle } from 'react-icons/fa'

interface Props {
  modal: string
  label: string
  modalSize: string
  content: any
}

const ModalView = ({ modal, label, modalSize, content }: Props) => {
  return (
    <div
      className="modal fade"
      id={modal}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex={-1}
      aria-labelledby={`${modal}Label`}
      aria-hidden="true"
    >
      <div className={`modal-dialog ${modalSize}`}>
        <div className="modal-content modal-background">
          <div className="modal-header">
            <h3 className="modal-title " id={`${modal}Label`}>
              {label}
            </h3>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">{content}</div>

          <div className="modal-body">
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger text-white"
                data-bs-dismiss="modal"
              >
                <>
                  <FaTimesCircle className="mb-1" /> Close
                </>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalView
