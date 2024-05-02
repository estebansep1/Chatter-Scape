/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import "../App.css";
import exampleImage from "../images/signup.jpg";
import { useNavigate } from 'react-router-dom';

export const SlideInAuth = () => {
  return (
    <section className="grid min-h-screen grid-cols-1 bg-slate-50 md:grid-cols-[1fr,_400px] lg:grid-cols-[1fr,_600px]">
      <Logo />
      <Form />
      <SupplementalContent />
    </section>
  );
};

const Form = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const navigate = useNavigate();

  const isValidUsername = (username) => {
    const re = /^[a-zA-Z0-9._-]+$/;
    return re.test(username);
  };

  const handleUsernameChange = (e) => {
    const { value } = e.target;
    if (!isValidUsername(value) && value !== "") {
      setErrorMessage({ text: "Username contains invalid characters!", type: "error" });
    } else {
      setUsername(value);
      setErrorMessage(""); 
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    const userData = { username, password };

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 403 && data.lockoutUntil) {
              console.log("Lockout time (UTC):", new Date(data.lockoutUntil).toISOString());
              console.log("Current time (UTC):", new Date().toISOString());
                const lockoutDate = new Date(data.lockoutUntil);
                const formattedTime = lockoutDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true, hourCycle: 'h12' });
                setErrorMessage({ text: `Account is locked until ${formattedTime}. Please try again later.`, type: "error" });
            } 
            else {
                setErrorMessage({ text: data.message || "Failed to login", type: "error" });
            }
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);

        navigate(data.profileCompleted ? '/dashboard' : '/settings');
        setErrorMessage({ text: "Login successful!", type: "success" });
    } catch (error) {
        console.error("Login Error:", error);
        setErrorMessage({ text: error.message || "An error occurred during login", type: "error" });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== retypePassword) {
        setErrorMessage({ text: "Passwords do not match!", type: "error" });
        return;
    }

    const userData = {
        username,
        password
    };

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to register");
        }

        setErrorMessage({ text: "Registration successful! Please log in.", type: "success" });
        setUsername("");
        setPassword("");
        setRetypePassword("");
        navigate('/login');
    } catch (error) {
        setErrorMessage({
            text: error.message || "An error occurred during registration",
            type: "error",
        });
    }
};


  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      transition={{
        staggerChildren: 0.2,
      }}
      viewport={{ once: true }}
      className="flex items-center justify-center pb-4 pt-20 md:py-20"
    >
      <div className="mx-auto my-auto max-w-xl px-4 md:pr-0">
        <motion.h1
          variants={primaryVariants}
          className="mb-2 text-center text-4xl font-semibold"
        >
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </motion.h1>
        <motion.p variants={primaryVariants} className="mb-8 text-center">
          Start messaging friends today on ChatterScape!
        </motion.p>
        <motion.form
          variants={primaryVariants}
          onSubmit={isSignUp ? handleSignup : handleSignin}
          className="w-full max-w-lg space-y-4"
        >
          <div className="mb-2 w-full">
            <label
              htmlFor="username-input"
              className="mb-1 block text-sm font-medium"
            >
              Username<span className="text-red-600">*</span>
            </label>
            <input
              id="username-input"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={handleUsernameChange}
              className="w-full md:w-96 rounded border border-slate-300 px-2.5 py-1.5 focus:outline-indigo-600"
              required
            />
          </div>

          <div className="mb-2 w-full">
            <label
              htmlFor="password-input"
              className="mb-1 block text-sm font-medium"
            >
              Password<span className="text-red-600">*</span>
            </label>
            <input
              id="password-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-slate-300 px-2.5 py-1.5 focus:outline-indigo-600"
              required
            />
          </div>

          {isSignUp && (
            <div className="mb-4 w-full">
              <label
                htmlFor="rt-password-input"
                className="mb-1 block text-sm font-medium"
              >
                Re-type Password<span className="text-red-600">*</span>
              </label>
              <input
                id="rt-password-input"
                type="password"
                placeholder="Re-type your password"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                className="w-full rounded border border-slate-300 px-2.5 py-1.5 focus:outline-indigo-600"
                required
              />
            </div>
          )}

          <motion.button
            variants={primaryVariants}
            whileTap={{
              scale: 0.985,
            }}
            type="submit"
            className="mb-1.5 w-full rounded bg-cyan-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-cyan-700"
          >
            {isSignUp ? "Sign up" : "Sign in"}
          </motion.button>
          <motion.p variants={primaryVariants} className="text-xs">
            {isSignUp
              ? "Already have an account? "
              : "Need to create an account? "}
            <a
              className="text-cyan-600 underline"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsSignUp(!isSignUp);
                setErrorMessage({});
              }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </a>
          </motion.p>
          {errorMessage && (
            <div className={`message ${errorMessage.type}`}>
              {errorMessage.text}
            </div>
          )}
        </motion.form>
      </div>
    </motion.div>
  );
};

const SupplementalContent = () => {
  return (
    <div className="group sticky top-4 m-4 h-80 overflow-hidden rounded-3xl rounded-tl-[4rem] bg-slate-950 md:h-[calc(100vh_-_2rem)]">
      <img
        alt="An example image"
        src={exampleImage}
        className="h-full w-full bg-white object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-50"
      />

      <div className="absolute right-2 top-4 z-10">
        <FiArrowUpRight className="rotate-45 text-6xl text-indigo-200 opacity-0 transition-all duration-500 group-hover:rotate-0 group-hover:opacity-100" />
      </div>

      <motion.div
        initial="initial"
        whileInView="animate"
        transition={{
          staggerChildren: 0.05,
        }}
        viewport={{ once: true }}
        className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-slate-950/90 to-slate-950/0 p-8"
      >
        <motion.h2
          className="mb-2 text-3xl font-semibold leading-[1.25] text-white lg:text-4xl"
          variants={primaryVariants}
        >
          Where Conversations
          <br />
          come Alive
        </motion.h2>
        <motion.p
          variants={primaryVariants}
          className="mb-6 max-w-md text-sm text-slate-300"
        >
          Dive into a world where your words create connections, explore
          communities that share your interests, and forge friendships that go
          beyond the digital realm. Welcome to ChatterScape – your space to
          chat, share, and belong.
        </motion.p>
        <div className="flex items-center gap-4">
          <div>
            <motion.p
              variants={primaryVariants}
              className="text-xs text-slate-300"
            >
              Discover endless topics and start meaningful conversations on
              ChatterScape.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="39"
      viewBox="0 0 37.5 30"
      className="absolute left-[50%] top-4 -translate-x-[50%] fill-slate-950 md:left-4 md:-translate-x-0"
    >
      <defs>
        <clipPath id="290b5645d1">
          <path
            d="M 3.265625 1.828125 L 33.75 1.828125 L 33.75 27.230469 L 3.265625 27.230469 Z M 3.265625 1.828125"
            clipRule="nonzero"
          />
        </clipPath>
      </defs>
      <g clipPath="url(#290b5645d1)">
        <path
          fill="black"
          d="M 21.679688 19.609375 C 23.429688 19.609375 24.851562 18.183594 24.851562 16.433594 L 24.851562 5.003906 C 24.851562 3.253906 23.429688 1.828125 21.679688 1.828125 L 6.457031 1.828125 C 4.707031 1.828125 3.285156 3.253906 3.285156 5.003906 L 3.285156 16.433594 C 3.285156 18.183594 4.707031 19.609375 6.457031 19.609375 L 8.359375 19.609375 L 8.359375 22.785156 C 8.359375 23.023438 8.496094 23.246094 8.710938 23.351562 C 8.800781 23.398438 8.898438 23.421875 8.996094 23.421875 C 9.128906 23.421875 9.261719 23.375 9.375 23.292969 L 14.28125 19.609375 Z M 30.558594 5.636719 L 26.753906 5.636719 C 26.402344 5.636719 26.117188 5.921875 26.117188 6.273438 L 26.117188 16.433594 C 26.117188 18.886719 24.128906 20.878906 21.679688 20.878906 L 14.914062 20.878906 C 14.777344 20.878906 14.644531 20.925781 14.535156 21.007812 L 13.484375 21.796875 C 13.320312 21.917969 13.226562 22.109375 13.230469 22.3125 C 13.230469 22.511719 13.328125 22.703125 13.492188 22.820312 C 14.039062 23.214844 14.675781 23.421875 15.335938 23.421875 L 22.734375 23.421875 L 27.640625 27.101562 C 27.753906 27.1875 27.886719 27.230469 28.023438 27.230469 C 28.117188 27.230469 28.214844 27.207031 28.304688 27.164062 C 28.519531 27.054688 28.65625 26.835938 28.65625 26.59375 L 28.65625 23.421875 L 30.558594 23.421875 C 32.308594 23.421875 33.730469 21.996094 33.730469 20.246094 L 33.730469 8.8125 C 33.730469 7.0625 32.308594 5.636719 30.558594 5.636719 Z"
          fillOpacity="1"
          fillRule="nonzero"
        />
      </g>
    </svg>
  );
};

const primaryVariants = {
  initial: {
    y: 25,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
};
