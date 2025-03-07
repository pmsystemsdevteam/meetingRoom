import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import icons
import { useNavigate } from "react-router";
import Spinner from "../../Components/Spinner";
import "./Login.scss";
import toast from "react-hot-toast";

function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()
    const [isLoading, setisLoading] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (data) => {
        try {
            setisLoading(true)
            const response = await axios.post('https://api.pmsystems.az/login/', data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            localStorage.setItem('meeting_room_access_token', response.data.token)
            navigate('/meeting-room/calendar')
        } catch (error) {
            setisLoading(false)
            console.log(error.message)
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Sign In</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            required
                            type="text"
                            placeholder="Enter your username"
                            {...register("username",)}
                        />
                        {errors.username && <p className="error">{errors.username.message}</p>}
                    </div>

                    <div className="form-group password-group">
                        <label>Password</label>
                        <div className="password-container">
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                {...register("password", {
                                    minLength: {
                                        value: 5,
                                        message: "Password must be at least 5 characters long"
                                    }
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </button>
                        </div>
                        {errors.password && <p className="error">{errors.password.message}</p>}
                    </div>

                    <button className='login-button' type="submit">{isLoading ? <Spinner /> : "Submit"}</button>
                    {/* <button className='login-button' type="submit">Submit</button> */}
                </form>
            </div>
        </div>
    );
}

export default Login;
