export default function AdminLoading() {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight: '70vh'}}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
          <span className="sr-only">Loading...</span>
        </div>
        <div className="mt-3 h5 mb-0">Loading Admin Panel...</div>
      </div>
    </div>
  )
}
