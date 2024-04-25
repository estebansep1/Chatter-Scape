import React, { useState } from "react";
import Pica from 'pica';
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const pica = Pica();
  const navigate = useNavigate();
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [resizedProfilePic, setResizedProfilePic] = useState(null);
  const [resizedCoverPhoto, setResizedCoverPhoto] = useState(null);

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        pica.resize(img, canvas)
          .then(resizedCanvas => pica.toBlob(resizedCanvas, file.type, 0.90))
          .then(blob => {
            console.log(`Resized image size: ${blob.size} bytes`);
            URL.revokeObjectURL(img.src);
            resolve(blob);
          })
          .catch(error => {
            URL.revokeObjectURL(img.src);
            reject(error);
          });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Image loading error'));
      };
    });
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Original image size: ${file.size} bytes`);
      resizeImage(file, 128, 128).then(resizedBlob => {
        setResizedProfilePic(resizedBlob);
        setProfilePicPreview(URL.createObjectURL(resizedBlob));
      }).catch(console.error);
    }
  };
  
  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Original image size: ${file.size} bytes`);
      resizeImage(file, 800, 600).then(resizedBlob => {
        setResizedCoverPhoto(resizedBlob);
        setCoverPhotoPreview(URL.createObjectURL(resizedBlob));
      }).catch(console.error);
    }
  };
 

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("userId", localStorage.getItem("userId"));
    formData.append("firstName", document.getElementById("first-name").value);
    formData.append("lastName", document.getElementById("last-name").value);
    formData.append("username", document.getElementById("username").value);
    formData.append("about", document.getElementById("about").value);

    if (resizedProfilePic) {
      formData.append("profilePicture", resizedProfilePic);
    }
    if (resizedCoverPhoto) {
      formData.append("coverPhoto", resizedCoverPhoto);
    }

    try {
      const response = await fetch("http://localhost:5001/api/user/updateProfile", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
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
                    />
                  </div>
                </div>
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    defaultValue={""}
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
                            onClick={() =>
                              document
                                .getElementById("file-cover-upload")
                                .click()
                            }
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
                  />
                </div>
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
      </form>
    </div>
  );
}
