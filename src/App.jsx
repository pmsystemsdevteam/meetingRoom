import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login/Login'
import MeetingRoomCalendar from './Pages/MeetingRoomCalendar/MeetingRoomCalendar'
import PrivateRoute from './PrivateRoute'
import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/meeting-room/calendar" element={<MeetingRoomCalendar />} />
        </Route>
        <Route path="*" element={<Navigate to={'/'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
