/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import Pica from "pica";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import Deactivate from "./DeactivateAccount";
import EncryptButton from "./PasswordBtn";

export default function SettingsPage() {
  const pica = Pica();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [resizedProfilePic, setResizedProfilePic] = useState(null);
  const [resizedCoverPhoto, setResizedCoverPhoto] = useState(null);
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [usernameModified, setUsernameModified] = useState(false);
  const [initialUsername, setInitialUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        const data = response.data;
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setAbout(data.about);
        setUsername(data.username);
        setInitialUsername(data.username);
        if (data.profilePicture) {
          setProfilePicPreview(
            `${process.env.REACT_APP_API_URL}/uploads/${data.profilePicture
              .split("/")
              .pop()}`
          );
        }
        if (data.coverPhoto) {
          setCoverPhotoPreview(
            `${process.env.REACT_APP_API_URL}/uploads/${data.coverPhoto
              .split("/")
              .pop()}`
          );
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        pica
          .resize(img, canvas)
          .then((resizedCanvas) => pica.toBlob(resizedCanvas, file.type, 0.9))
          .then((blob) => {
            console.log(`Resized image size: ${blob.size} bytes`);
            URL.revokeObjectURL(img.src);
            resolve(blob);
          })
          .catch((error) => {
            URL.revokeObjectURL(img.src);
            reject(error);
          });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Image loading error"));
      };
    });
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Original image size: ${file.size} bytes`);
      resizeImage(file, 128, 128)
        .then((resizedBlob) => {
          setResizedProfilePic(resizedBlob);
          setProfilePicPreview(URL.createObjectURL(resizedBlob));
        })
        .catch(console.error);
    }
  };

  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Original image size: ${file.size} bytes`);
      resizeImage(file, 800, 600)
        .then((resizedBlob) => {
          setResizedCoverPhoto(resizedBlob);
          setCoverPhotoPreview(URL.createObjectURL(resizedBlob));
        })
        .catch(console.error);
    }
  };

  const token = localStorage.getItem("token");

  const debouncedCheckUsernameAvailability = useMemo(
    () =>
      debounce(async (newUsername) => {
        if (!newUsername.trim()) return;
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/user/check-username`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ username: newUsername }),
            }
          );

          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.message ||
                "Username is already taken or unauthorized request."
            );
          }

          setSuccessMessage("Username is available!");
          setErrorMessage("");
        } catch (error) {
          setErrorMessage(error.message);
          setSuccessMessage("");
        }
      }, 300),
    [token]
  );

  const validateUsername = (newUsername) => {
    const re = /^[a-zA-Z0-9._-]+$/;
    if (!re.test(newUsername)) {
      setErrorMessage("Username contains invalid characters.");
      setSuccessMessage("");
      return false;
    }
    return true;
  };

  const checkUsernameAvailability = async (newUsername) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/check-username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Username is already taken or unauthorized request."
        );
      }
      setSuccessMessage("Username is available!");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    }
  };

  const handleUsernameChange = (event) => {
    const newUsername = event.target.value;
    setUsername(newUsername);
    setUsernameModified(true);

    if (newUsername !== username) {
      const isValidUsername = validateUsername(newUsername);

      if (isValidUsername) {
        checkUsernameAvailability(newUsername);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (username !== initialUsername) {
      if (!validateUsername(username)) {
        return;
      }

      try {
        const availabilityResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/user/check-username`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ username }),
          }
        );
        const availabilityData = await availabilityResponse.json();
        if (!availabilityResponse.ok) {
          setErrorMessage(
            availabilityData.message ||
              "Username is already taken or unauthorized request."
          );
          return;
        }
      } catch (error) {
        console.error("Username availability check failed:", error);
        setErrorMessage("Failed to check username availability.");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("userId", localStorage.getItem("userId"));
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("username", username);
      formData.append("about", about);
      if (resizedProfilePic)
        formData.append("profilePicture", resizedProfilePic);
      if (resizedCoverPhoto) formData.append("coverPhoto", resizedCoverPhoto);

      const updateResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/updateProfile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.message || "Failed to update profile");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
      setErrorMessage(error.message);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const isValidPassword = (password) => {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;
    return re.test(password);
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordErrorMessage("");
    setPasswordSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage("Passwords do not match");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordErrorMessage(
        "Password must contain at least 8 characters, including 1 uppercase, 1 lowercase, 1 number, and 1 special character."
      );
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/updatePassword`,
        { newPassword },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        setPasswordSuccessMessage("Password updated successfully");
      } else {
        setPasswordErrorMessage("Unexpected error occurred. Please try again.");
      }
    } catch (error) {
      setPasswordErrorMessage("Failed to update password");
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/user/deleteAccount`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.status === 204) {
        localStorage.clear();
        setIsDeactivateModalOpen(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error deleting the account:", error);
      setIsDeactivateModalOpen(false);
    }
  };

  const handleDeactivateClick = () => {
    setIsDeactivateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeactivateModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-8 sm:px-6 lg:px-8">
      <form onSubmit={handleSave} className="w-full max-w-2xl">
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Account Settings
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="sm:col-span-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Username
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="username"
                      value={username}
                      onChange={handleUsernameChange}
                    />
                  </div>
                </div>
                {errorMessage && (
                  <div style={{ color: "red" }}>{errorMessage}</div>
                )}
                {successMessage && (
                  <div style={{ color: "green" }}>{successMessage}</div>
                )}
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  About
                </label>
                <div className="mt-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Write a few sentences about yourself.
                </p>
              </div>

              <div className="space-y-10">
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Photo
                </label>
                <div className="flex flex-col items-center">
                  {profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      alt="Profile Preview"
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon
                      className="h-12 w-12 text-gray-300"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    }
                  >
                    Change Photo
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    name="profilePicture"
                    accept="image/png, image/jpeg"
                    className="sr-only"
                    onChange={handleProfilePicChange}
                  />
                </div>
                <div className="col-span-full">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Cover photo
                  </label>
                  <div className="mt-2 flex justify-center items-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 relative">
                    <div className="text-center">
                      {coverPhotoPreview ? (
                        <img
                          src={coverPhotoPreview}
                          alt="Cover Preview"
                          style={{ width: "100%", height: "auto" }}
                        />
                      ) : (
                        <PhotoIcon
                          className="mx-auto h-12 w-12 text-gray-300"
                          aria-hidden="true"
                        />
                      )}
                      <div
                        style={{
                          position: "relative",
                          height: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        className="mt-4 w-full pb-2"
                      >
                        <div>
                          <label
                            htmlFor="file-cover-upload"
                            className="cursor-pointer rounded-md bg-white font-semibold text-cyan-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-600 focus-within:ring-offset-2 hover:text-cyan-500"
                          >
                            <span>Upload a cover photo</span>
                            <input
                              id="file-cover-upload"
                              name="file-cover-upload"
                              accept="image/png, image/jpeg"
                              type="file"
                              className="sr-only"
                              onChange={handleCoverPhotoChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Personal Information
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    autoComplete="family-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-6 shadow-sm rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Security Settings
              </h3>
              <div className="relative">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-900"
                >
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: 20,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 12px",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="mt-4 relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-900"
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: 20,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 12px",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {passwordErrorMessage && (
                <p className="mt-2 text-sm text-red-600">
                  {passwordErrorMessage}
                </p>
              )}
              {passwordSuccessMessage && (
                <p className="mt-2 text-sm text-green-600">
                  {passwordSuccessMessage}
                </p>
              )}
              <div className="flex justify-center mt-4">
                <EncryptButton onClick={handlePasswordUpdate} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-4 pt-5">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-cyan-600 py-2 px-3 text-sm font-medium text-white shadow-sm hover:bg-cyan-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
        <div className="flex justify-center pt-5">
          <button
            type="button"
            onClick={handleDeactivateClick}
            className="px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:outline-none dark:bg-red-600 dark:hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </form>
      {isDeactivateModalOpen && (
        <Deactivate
          isOpen={isDeactivateModalOpen}
          setIsOpen={setIsDeactivateModalOpen}
          onConfirm={handleAccountDeletion}
        />
      )}
    </div>
  );
}
