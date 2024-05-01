import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { FiUser, FiArrowLeft } from "react-icons/fi";

const ProfileCard = () => {
  return (
    <div className="grid w-full place-content-center bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-12 text-slate-900">
      <TiltCard />
    </div>
  );
};

const TiltCard = () => {
  const ref = useRef(null);
  const [user, setUser] = useState(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const ROTATION_RANGE = 32.5;
  const HALF_ROTATION_RANGE = 32.5 / 2;

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser({
          ...response.data,
          profilePicture: response.data.profilePicture
            ? `${process.env.REACT_APP_API_URL}/uploads/${response.data.profilePicture.split("/").pop()}`
            : null,
          about: response.data.about || "No about info available.",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className="relative h-96 w-72 rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300"
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-4 grid place-content-center rounded-xl bg-white shadow-lg"
      >
        {user ? (
          <>
            <button
              onClick={() => window.history.back()} // Navigate back in browser history
              className="absolute top-3 left-3 text-indigo-500 bg-transparent hover:bg-indigo-100 rounded-full p-2"
              style={{ transform: "translateZ(50px)" }} // Elevate the button in 3D space
            >
              <FiArrowLeft size={24} />
            </button>
            <div
              className="flex justify-center"
              style={{ transform: "translateZ(75px)" }}
            >
              <img
                src={user.profilePicture || ""}
                alt="Profile"
                className="rounded-full border-4 border-white"
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                }}
              />
            </div>
            <p
              className="text-xl font-semibold text-black mt-4"
              style={{ transform: "translateZ(50px)" }}
            >
              {user.username}
            </p>
            <p
              className="text-black text-center"
              style={{ transform: "translateZ(50px)" }}
            >
              {user.about}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FiUser
              className="mx-auto text-4xl"
              style={{ transform: "translateZ(75px)" }}
            />
            <p
              className="text-center text-2xl font-bold"
              style={{ transform: "translateZ(50px)" }}
            >
              Loading...
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileCard;
