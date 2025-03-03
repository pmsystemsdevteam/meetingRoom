import { Navigate, Outlet } from "react-router";

function PrivateRoute() {
  const token = localStorage.getItem('meeting_room_access_token')
  if (token) {
    return (
      <Outlet />
    )
  } else {
    return (
      <Navigate to={'/'} />
    )
  }
}

export default PrivateRoute;