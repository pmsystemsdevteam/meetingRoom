import "./CallCenterComponent.scss";
import { IoSearchOutline } from "react-icons/io5";
import React, { useEffect, useState, useRef } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Box } from "@mui/material";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { GoDotFill } from "react-icons/go";

function CallCenterComponent({ setHasNewNotification }) {
    const [search, setSearch] = useState("");
    const [hidden, setHidden] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [view, setView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [boxData, setBoxData] = useState([]);
    const [prevData, setPrevData] = useState([]);
    const [prevBoxData, setPrevBoxData] = useState([]);
    const prevDataRef = useRef(prevData);
    const prevBoxDataRef = useRef(prevBoxData);
    const tableRef = useRef();
    const [appointmentPage, setAppointmentPage] = useState(1);
    const [chatPage, setChatPage] = useState(1);
    const [hasNewAppointment, setHasNewAppointment] = useState(false);
    const [hasNewChat, setHasNewChat] = useState(false);
    const itemsPerPage = 10;

    const confirmDeleteFnc = (dataToDelete) => {
        confirmAlert({
            title: "Confirm to submit",
            message: "Are you sure you want to delete this?",
            buttons: [
                {
                    label: "Yes",
                    onClick: () => DeleteData(dataToDelete),
                },
                {
                    label: "No",
                },
            ],
        });
    };

    useEffect(() => {
        prevDataRef.current = prevData;
        prevBoxDataRef.current = prevBoxData;
    }, [prevData, prevBoxData]);

    async function GetDataChat() {
        setHasNewNotification(false);

        try {
            setLoading(true);
            const res = await axios.get(
                "https://api.melhemhospital.org/api/v1/chat-data/"
            );
            const isInitialLoad = prevBoxDataRef.current.length === 0;
            const hasNewData =
                JSON.stringify(res.data) !== JSON.stringify(prevBoxDataRef.current);

            if (!isInitialLoad && hasNewData) {
                setHasNewChat(true);
                setHasNewNotification(true);
            } else {
                setHasNewChat(false);
            }
            setBoxData(res.data || []);
            setPrevBoxData(res.data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch chat data: " + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function GetAppointmentData() {
        localStorage.setItem("Notification", "False");
        try {
            const res = await axios.get(
                "https://api.melhemhospital.org/api/v1/appointment-data/"
            );
            const isInitialLoad = prevDataRef.current.length === 0;
            const hasNewData =
                JSON.stringify(res.data) !== JSON.stringify(prevDataRef.current);

            if (res.data && !isInitialLoad && hasNewData) {
                setHasNewAppointment(true);
                setHasNewNotification(true);
            } else if (!isInitialLoad && !hasNewData) {
                setHasNewAppointment(false);
            }
            setData(res.data);
            setPrevData(res.data);
        } catch (error) {
            setError("Failed to fetch appointment data: " + error.message);
            console.log(error.message);
        }
    }

    async function DeleteData(number) {
        if (!number) {
            setError("Number is undefined, cannot delete.");
            return;
        }
        try {
            await axios.delete(
                https://api.melhemhospital.org/api/v1/chat-data/?number=${number}
            );
            setBoxData((prevData) =>
                prevData.filter((item) => (item.number || item.phone) !== number)
            );
            setError(null);
        } catch (err) {
            console.error("Delete error:", err);
            setError("Failed to delete data: " + err.message);
        }
    }

    const formatDate = (date) => {
        if (!date) return null;
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        return ${ month } /${day}/${ year };
    };

    const handleChange = (date) => {
        if (!date) return;
        const formattedDate = formatDate(date.toDate());
        setSelectedDate(formattedDate);
    };

    const filterData = (dataset) => {
        if (!dataset) return [];
        return dataset
            .filter((x) => {
                if (!x) return false;
                return (
                    (x.patient?.toLowerCase() || "").includes(search.toLowerCase()) ||
                    (x.technical?.toLowerCase() || "").includes(search.toLowerCase()) ||
                    (x.service?.toLowerCase() || "").includes(search.toLowerCase()) ||
                    (x.phone || x.number || "").includes(search)
                );
            })
            .filter((x) => (hidden ? x.status !== "success" : true))
            .filter((x) => (!selectedDate ? true : x.date === selectedDate));
    };

    async function HandleEdit(status, item) {
        delete item._id;
        try {
            const response = await axios.patch(
                `https://api.melhemhospital.org/api/v1/appointment-data/?number=${item.number}`,
                { ...item, status: status },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.data) {
                console.log("Appointment data updated successfully:", response.data);
            } else {
                console.error("No data returned from the API.");
            }
            GetAppointmentData();
        } catch (err) {
            setError("Failed to update appointment data: " + err.message);
        }
    }

    const filteredAppointmentData = filterData(data).reverse();
    const filteredChatData = filterData(boxData).reverse();

    const currentPage = view ? appointmentPage : chatPage;
    const filteredData = view ? filteredAppointmentData : filteredChatData;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (view) {
            setAppointmentPage(pageNumber);
        } else {
            setChatPage(pageNumber);
        }
    };

    useEffect(() => {
        GetDataChat();
        GetAppointmentData();
        const intervalId = window.setInterval(() => {
            GetDataChat();
            GetAppointmentData();
        }, 60000);
        return () => window.clearInterval(intervalId);
    }, []);
    

    useEffect(() => {
        if (view) {
            setHasNewAppointment(false);
        } else {
            setHasNewChat(false);
        }
    }, [view]);

    if (error) {
        return (
            <section id="callCenterComponent">
                <div>Error: {error}</div>
                <button
                    onClick={() => {
                        setError(null);
                        GetDataChat();
                        GetAppointmentData();
                    }}
                >
                    Retry
                </button>
            </section>
        );
    }

    if (loading) {
        return (
            <section id="callCenterComponent">
                <div className="loader"></div>
            </section>
        );
    }

    return (
        <section id="callCenterComponent">
            <div className="upBox">
                <div className="up">
                    <p>{view === true ? "Appointments" : "Chat Box"}</p>
                    <div className="calendarBox">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box width={"250px"}>
                                <DatePicker label="Choose Date..." onChange={handleChange} />
                            </Box>
                        </LocalizationProvider>
                    </div>
                </div>
                <div className="down">
                    <div className="searchBox">
                        <div className="icon">
                            <IoSearchOutline />
                        </div>
                        <input
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="otherBtns">
                        <label className="btn" htmlFor="checInput">
                            <input
                                type="checkbox"
                                id="checInput"
                                onChange={() => setHidden(!hidden)}
                            />
                            <span className="checkbox-container"></span>
                            <p>Hide successed</p>
                        </label>
                    </div>
                </div>
            </div>
            <div className="downBox">
                <div className="table-controls">
                    <button
                        onClick={() => setView(true)}
                        className={view === true ? "active" : ""}
                    >
                        Appointment
                        {hasNewAppointment && (
                            <i>
                                <GoDotFill />
                            </i>
                        )}
                    </button>
                    <button
                        onClick={() => setView(false)}
                        className={view === false ? "active" : ""}
                    >
                        ChatBox
                        {hasNewChat && (
                            <i>
                                <GoDotFill />
                            </i>
                        )}
                    </button>
                </div>
                <div className="table-container">
                    <table ref={tableRef}>
                        <thead>
                            <tr>
                                <td>Id</td>
                                <td>Phone</td>
                                {view ? <td>Time</td> : <td>Delete</td>}
                                {view && (
                                    <>
                                        <td>Date</td>
                                        <td>Patient</td>
                                        <td>Service</td>
                                        <td>Technician</td>
                                        <td>Status</td>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="idBox">{indexOfFirstItem + index + 1}</td>
                                    <td>{item.phone || item.number || "N/A"}</td>
                                    <td className="idBox">
                                        {view ? (
                                            item.time || "N/A"
                                        ) : (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        confirmDeleteFnc(item.number || item.phone)
                                                    }
                                                    style={{ marginLeft: "10px" }}
                                                    disabled={!item.number && !item.phone}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    {view && (
                                        <>
                                            <td>{item.date || "N/A"}</td>
                                            <td>{item.patient || "N/A"}</td>
                                            <td>{item.service || "N/A"}</td>
                                            <td>{item.technical || "N/A"}</td>
                                            <td>
                                                <select
                                                    onChange={(e) => HandleEdit(e.target.value, item)}
                                                    className="status-select"
                                                    value={item.status || "waiting"}
                                                    style={{
                                                        color:
                                                            item.status === "waiting"
                                                                ? "red"
                                                                : item.status === "schedule"
                                                                    ? "blue"
                                                                    : item.status === "success"
                                                                        ? "green"
                                                                        : "black",
                                                    }}
                                                >
                                                    <option style={{ color: "red" }} value="waiting">
                                                        Waiting
                                                    </option>
                                                    <option style={{ color: "blue" }} value="schedule">
                                                        Schedule
                                                    </option>
                                                    <option style={{ color: "green" }} value="success">
                                                        Success
                                                    </option>
                                                </select>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {currentItems.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={view ? 8 : 3}
                                        style={{ textAlign: "center", padding: "10px" }}
                                    >
                                        No matching records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {filteredData.length > itemsPerPage && (
                        <div
                            className="pagination"
                            style={{ marginTop: "20px", textAlign: "center" }}
                        >
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{ margin: "0 5px" }}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    style={{
                                        margin: "0 5px",
                                        backgroundColor: currentPage === i + 1 ? "#773693" : "#fff",
                                        color: currentPage === i + 1 ? "#fff" : "#000",
                                        border: "1px solid #ccc",
                                        padding: "5px 10px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{ margin: "0 5px" }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default CallCenterComponent;