import axios from "axios";
import "./AllMeetingsModal.scss"
import Modal from "react-modal";
import Switch from "react-switch";
import { useEffect, useState } from "react";
import dayjs from "dayjs"; // Install with `npm install dayjs`
import customParseFormat from "dayjs/plugin/customParseFormat";
import api from "../../api";

dayjs.extend(customParseFormat);

Modal.setAppElement('#root');

function AllMeetingsModal({ setisAllMeetingsModalOpen, isAllMeetingsModalOpen }) {
    const [currentItems, setCurrentItems] = useState(null);
    const [allMeetings, setAllMeetings] = useState(null);
    const [checked, setChecked] = useState(false);

    const handleChange = () => {
        setChecked(prev => !prev);
    };

    const getAllMeetings = async () => {
        try {
            const { data } = await api.get("/events/", {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            setAllMeetings(data);
            setCurrentItems(data);
        } catch (error) {
            console.log('error', error.message);
        }
    };

    useEffect(() => {
        getAllMeetings();
    }, []);

    useEffect(() => {
        if (allMeetings) {
            if (!checked) {
                // Show only future meetings
                const now = dayjs();
                const futureMeetings = allMeetings.filter(item => {
                    const meetingDateTime = dayjs(`${item.full_date} ${item.start_time}`, "DD/MM/YYYY HH:mm");
                    return meetingDateTime.isAfter(now);
                });
                setCurrentItems(futureMeetings);
            } else {
                // Show all meetings
                setCurrentItems(allMeetings);
            }
        }
    }, [checked, allMeetings]);


    return (
        <Modal
            isOpen={isAllMeetingsModalOpen}
            onRequestClose={() => setisAllMeetingsModalOpen(false)}
            className="custom-modal"
            overlayClassName="custom-overlay"
        >
            <div className="active-meet">
                <Switch
                    onChange={handleChange}
                    checked={!checked}
                    offColor="#e3e3e3"
                    onColor="#004744"
                    checkedIcon={false}
                    uncheckedIcon={false}
                />
                <p>
                    {!checked ? "Future Meetings" : "All Meetings"}
                </p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Event Title</th>
                        <th>Company Name</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Date</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.event_title}</td>
                                <td>{item.company}</td>
                                <td>{item.start_time}</td>
                                <td>{item.end_time}</td>
                                <td>{item.full_date}</td>
                                <td>{item.description ? item.description : "N/A"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No meetings found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Modal>
    );
}

export default AllMeetingsModal;
