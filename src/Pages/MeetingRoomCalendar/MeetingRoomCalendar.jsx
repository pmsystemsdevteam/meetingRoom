import { useEffect, useState } from "react";
import "./MeetingRoomCalendar.scss";
import Modal from "react-modal";
import {  TimePicker } from 'antd';
import meetroomuserlogo from "/public/meetroomuserlogo.png"
import meetroomaddlogo from "/public/meetroomaddlogo.png"
import mainLogo from "/public/newPMLogo.png"
import axios from "axios"
import { CiLogout } from "react-icons/ci";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Spinner from "../../Components/Spinner";
import toast from 'react-hot-toast';
Modal.setAppElement('#root');

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const MeetingRoomCalendar = () => {
    const [currentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [holidays, setHolidays] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventTitle, setEventTitle] = useState('')
    const [eventCompany, setEventCompany] = useState('')
    const [eventNotes, setEventNotes] = useState('')
    const [eventStart, setEventStart] = useState('')
    const [eventEnd, setEventEnd] = useState('')
    const [bookedDays, setBookedDays] = useState([])
    const [isLoading, setisLoading] = useState(false)
    const navigate = useNavigate()

    const handleStartTimeChange = (time) => {
        if (time) {
            const formattedTime = dayjs(time).format("HH:mm");
            setEventStart(formattedTime);
        } else {
            setEventStart(null);
        }
    };

    const handleEndTimeChange = (time) => {
        if (time) {
            const formattedTime = dayjs(time).format("HH:mm");
            setEventEnd(formattedTime);
        } else {
            setEventEnd(null);
        }
    };


    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await fetch(
                    `https://calendarific.com/api/v2/holidays?&api_key=sp9NXmvbAXP4I13zfQpQbwAN34wwnqyw&country=AZ&year=${currentDate.getFullYear()}`
                );
                const data = await response.json();

                const holidayMap = {};
                data.response.holidays.forEach((holiday) => {
                    const date = new Date(holiday.date.iso);
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    holidayMap[`${month}-${day}`] = holiday.name;
                });

                setHolidays(holidayMap);
            } catch (error) {
                console.error("Error fetching holidays:", error);
            }
        };
        fetchHolidays();
    }, [currentDate]);

    const generateMonthDays = (monthIndex) => {
        const daysInMonth = new Date(currentDate.getFullYear(), monthIndex + 1, 0).getDate();
        const firstDay = new Date(currentDate.getFullYear(), monthIndex, 1).getDay();
        const days = Array(firstDay).fill(null);

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const isHoliday = (month, day) => {
        return holidays[`${month + 1}-${day}`];
    };



    const handleDateClick = (day, monthIndex) => {
        if (!day) return;

        const formattedDay = day.toString().padStart(2, "0"); // Ensure two-digit day
        const formattedMonth = (monthIndex + 1).toString().padStart(2, "0"); // Ensure two-digit month
        const formattedDate = `${formattedDay}/${formattedMonth}/${currentDate.getFullYear()}`;

        setSelectedDate(formattedDate);
        setIsModalOpen(true);
    };


    const bookMeetingRoom = async (e) => {
        e.preventDefault();
        setisLoading(true)

        // Check if there's an overlapping booking for the selected date and time
        const conflictingBooking = bookedDays.find(event => {
            if (event.full_date === selectedDate) {
                // Check for time overlap
                const eventStartTime = dayjs(`${selectedDate} ${event.start_time}`, "DD/MM/YYYY HH:mm");
                const eventEndTime = dayjs(`${selectedDate} ${event.end_time}`, "DD/MM/YYYY HH:mm");
                const newStartTime = dayjs(`${selectedDate} ${eventStart}`, "DD/MM/YYYY HH:mm");
                const newEndTime = dayjs(`${selectedDate} ${eventEnd}`, "DD/MM/YYYY HH:mm");

                // Check if times overlap
                return newStartTime.isBefore(eventEndTime) && newEndTime.isAfter(eventStartTime);
            }

            return false;
        });

        if (conflictingBooking) {
            toast.error("Sorry, this day and time are already booked.");
            setisLoading(false)
            return;
        }

        // Proceed with booking if no conflict
        try {
            await axios.post('http://10.42.0.218:8000/events/', {
                event_title: eventTitle,
                description: eventNotes,
                full_date: selectedDate,
                start_time: eventStart,
                end_time: eventEnd,
                company: eventCompany,
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            toast.success("Room Booked Successfully!");
            setIsModalOpen(false);
            setisLoading(false)
            getEvents();
        } catch (error) {
            setisLoading(false)
            toast.error(error.message);
        }
    };


    const getEvents = async () => {
        try {
            const res = await axios.get("http://10.42.0.218:8000/events/", {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            setBookedDays(res.data)
        } catch (error) {
            console.log('error', error.message)
        }
    }
    useEffect(() => {
        getEvents()
    }, [])

    const handleLogOut = () => {
        localStorage.removeItem('meeting_room_access_token')
        navigate('/')
    }
    return (
        <>
            <div className="calendar-container">
                <div className="calendar-head">
                    <div className="mainlogo">
                        <a href="https://pmsystems.az" target="_blank">
                            <img src={mainLogo} alt="PM Systems Logo" title="PM Systems Logo" />
                        </a>
                    </div>
                    <CiLogout onClick={handleLogOut} title="Log Out" />
                </div>
                <div className="calendar-info">
                    <h1>Meeting Room Calendar {currentDate.getFullYear()}</h1>
                    <div className="calendar-day">
                        <span className="book"></span>
                        <span>Meeting Room Booked Days</span>
                    </div>
                    <div style={{ marginLeft: "12px" }} className="calendar-day">
                        <span className="holiday"></span>
                        <span>Holidays</span>
                    </div>
                </div>

                <div className="month-grid">
                    {MONTHS.map((month, monthIndex) => (
                        <div key={month} className="month-card">
                            <div className="month-name">{month}</div>
                            <div className="days-grid">
                                {DAYS.map((day) => (
                                    <div key={day} className="day-header">
                                        {day}
                                    </div>
                                ))}
                                {generateMonthDays(monthIndex).map((day, index) => {
                                    const dayDate = `${day?.toString()?.padStart(2, "0")}/${(monthIndex + 1)?.toString()?.padStart(2, "0")}/${currentDate?.getFullYear()}`;
                                    const bookedEventsForDay = bookedDays.filter(event => event?.full_date === dayDate);

                                    return (
                                        <div
                                            key={`${month}-${day}-${index}`}
                                            className={`day-cell ${day && isHoliday(monthIndex, day) ? "holiday" : ""} 
            ${bookedEventsForDay.length > 0 ? "booked" : ""} 
            ${selectedDate === `${day}:${monthIndex + 1}:${currentDate.getFullYear()}` ? "selected" : ""}`}
                                            onClick={() => handleDateClick(day, monthIndex)}
                                            title={day && isHoliday(monthIndex, day) ? holidays[`${monthIndex + 1}-${day}`] : ""}
                                        >
                                            {day}
                                            {bookedEventsForDay.length > 0 && (
                                                <div className="booked-modal">
                                                    {bookedEventsForDay.map((event, idx) => (
                                                        <div key={idx} className="modal-container">
                                                            <h4 className="title">{event.company}: </h4>
                                                            <div className="time">
                                                                <p>{event.start_time} - {event.end_time}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}


                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Modal Component */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                <form onSubmit={(e) => bookMeetingRoom(e)} className="modal-content">
                    <input required type="text" placeholder="Event Title" className="input-field" onChange={(e) => setEventTitle(e.target.value)} />
                    <div className="modal-options">

                        <TimePicker
                            required
                            className="first-date"
                            placeholder="Start Time"
                            showNow={false}
                            format="HH:mm"
                            // value={eventStart}
                            onChange={handleStartTimeChange}
                        />
                        <TimePicker
                            required
                            className="second-date"
                            placeholder="End Time"
                            showNow={false}
                            format="HH:mm"
                            // value={eventEnd}
                            onChange={handleEndTimeChange}
                        />
                    </div>
                    <div className="input-container">
                        <img src={meetroomuserlogo} alt="" />
                        <input required onChange={(e) => setEventCompany(e.target.value)} className="add-button" placeholder="Type Company Name" />
                    </div>

                    <div className="input-container">
                        <img style={{ width: "20px" }} src={meetroomaddlogo} alt="" />
                        <input onChange={(e) => setEventNotes(e.target.value)} style={{ border: 'none' }} className="add-button" placeholder="Add Notes" />
                    </div>
                    <button className="submit-button" type="submit">{isLoading ? <Spinner /> : "Book Day"}</button>
                </form>
            </Modal>
        </>
    );
};

export default MeetingRoomCalendar;