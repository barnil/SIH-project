export default function AdminDashboard() {
  return (
    <div className="hold-transition sidebar-mini">
      <div className="wrapper">
        <div className="content-wrapper" style={{minHeight: 'calc(100vh - 114px)'}}>
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="m-0">Admin Dashboard</h1>
                </div>
              </div>
            </div>
          </section>

          <section className="content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-3 col-6">
                  <div className="small-box bg-info">
                    <div className="inner">
                      <h3>150</h3>
                      <p>New Users</p>
                    </div>
                    <div className="icon">
                      <i className="fas fa-user-plus" aria-hidden></i>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="small-box bg-success">
                    <div className="inner">
                      <h3>53<sup style={{fontSize: '20px'}}>%</sup></h3>
                      <p>Engagement</p>
                    </div>
                    <div className="icon">
                      <i className="fas fa-chart-line" aria-hidden></i>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="small-box bg-warning">
                    <div className="inner">
                      <h3>44</h3>
                      <p>Redemptions</p>
                    </div>
                    <div className="icon">
                      <i className="fas fa-gift" aria-hidden></i>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="small-box bg-danger">
                    <div className="inner">
                      <h3>12</h3>
                      <p>Alerts</p>
                    </div>
                    <div className="icon">
                      <i className="fas fa-bell" aria-hidden></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
