import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { FiUser } from "react-icons/fi";

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const ROTATION_RANGE = 32.5;
  const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setUser({
          ...response.data,
          profilePicture: response.data.profilePicture ? `${process.env.REACT_APP_API_URL}/uploads/${response.data.profilePicture.split('/').pop()}` : null,
          coverPhoto: response.data.coverPhoto ? `${process.env.REACT_APP_API_URL}/uploads/${response.data.coverPhoto.split('/').pop()}` : null,
          about: response.data.about || "No about info available."
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (event) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (event.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (event.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid place-content-center bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-12 text-slate-900">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          transform,
        }}
        className="relative h-96 w-72 rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300 shadow-xl overflow-hidden"
      >
        <motion.img
          src={user.coverPhoto}
          alt="Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black bg-opacity-50">
          {user.profilePicture ? (
            <motion.img
              src={user.profilePicture}
              alt="Profile"
              className="h-24 w-24 rounded-full border-4 border-white"
            />
          ) : (
            <FiUser className="text-white h-24 w-24" />
          )}
          <motion.p
            className="text-xl font-semibold text-white mt-4"
          >
            {user.username}
          </motion.p>
          <motion.p
            className="text-white text-center"
          >
            {user.about}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCard;
