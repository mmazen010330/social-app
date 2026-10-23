import { useContext, useState, useRef } from "react";
import { Camera, Check, CloseCircle, DocumentUpload, GalleryEdit, Link as LinkIcon } from "iconsax-reactjs";
import toast from "react-hot-toast";
import { UserAuthContext } from "../UserAuthProvider/UserAuthProvider";
import { getUserData } from "../UserAuthProvider/userAuthProvider.services";
import { convertUrlToFile, uploadProfilePhoto } from "./changeProfilePic.services";
import AppButton from "../../SharedComponet/AppButton/AppButton";

type UploadMode = "url" | "file";

function ChangeProfilePic() {
  const { userData, setUserData } = useContext(UserAuthContext);

  const [mode, setMode] = useState<UploadMode>("url");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle URL input change
  function handleUrlChange(value: string) {
    setImageUrl(value);
    setUrlError(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setPreviewUrl(null);
      return;
    }

    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setUrlError("Please enter a valid URL starting with http:// or https://");
      setPreviewUrl(null);
      return;
    }

    // Try showing image preview
    setPreviewUrl(trimmed);
  }

  // Handle local file selection
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  // Reset/Clear chosen image
  function handleReset() {
    setImageUrl("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setUrlError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Switch between URL and File upload modes
  function switchMode(newMode: UploadMode) {
    if (newMode === mode) return;
    setMode(newMode);
    handleReset();
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === "url" && !imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    if (mode === "file" && !selectedFile) {
      toast.error("Please select an image file to upload");
      return;
    }

    setIsSubmitting(true);

    const uploadAction = async () => {
      let fileToUpload: File;

      if (mode === "url") {
        fileToUpload = await convertUrlToFile(imageUrl.trim());
      } else {
        if (!selectedFile) {
          throw new Error("No file selected");
        }
        fileToUpload = selectedFile;
      }

      // Call API PUT https://route-posts.routemisr.com/users/upload-photo
      const response = await uploadProfilePhoto(fileToUpload);

      // Extract new photo URL from response for immediate optimistic state update
      const newPhotoUrl =
        response?.user?.photo ||
        (response as any)?.data?.user?.photo ||
        (response as any)?.data?.photo ||
        (response as any)?.photo;

      if (newPhotoUrl) {
        setUserData((prev) => (prev ? { ...prev, photo: newPhotoUrl } : prev));
      }

      // Fetch fresh user data from API to ensure full context synchronization
      const freshUser = await getUserData();
      if (freshUser) {
        setUserData({ ...freshUser });
      } else if (response.user) {
        setUserData({ ...response.user });
      }

      handleReset();
      return response.message || "Profile photo updated successfully!";
    };

    toast.promise(uploadAction(), {
      loading: "Uploading profile photo...",
      success: (msg) => (
        <span className="text-emerald-600 font-medium capitalize">{msg}</span>
      ),
      error: (err) => {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to upload photo";
        return <span className="text-red-500 font-medium">{errorMsg}</span>;
      },
    }).finally(() => {
      setIsSubmitting(false);
    });
  }

  const defaultAvatar = "https://img.heroui.chat/image/avatar?w=400&h=400&u=3";
  const currentAvatar = userData?.photo || defaultAvatar;

  return (
    <section className="min-h-[calc(100vh-100px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 transition-all">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-50 text-main-color mb-4 shadow-sm">
            <Camera size="32" variant="Bulk" color="#2ccce4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Update Profile Photo
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload a new profile picture using an image URL or choose a file
          </p>
        </div>

        {/* Avatars Preview Section */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          {/* Current Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                key={currentAvatar}
                src={currentAvatar}
                alt="Current profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white shadow-md transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
              />
              <span className="absolute bottom-0 right-0 p-1 bg-slate-600 text-white rounded-full text-[10px] px-2 shadow">
                Current
              </span>
            </div>
            <span className="text-xs font-medium text-slate-600 truncate max-w-25">
              {userData?.name || "You"}
            </span>
          </div>

          <div className="h-12 w-px bg-slate-200" />

          {/* New Preview Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="New preview"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-main-color shadow-lg transition-transform hover:scale-105"
                    onError={() => {
                      setUrlError("Unable to load image preview from this URL");
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                    title="Remove preview"
                  >
                    <CloseCircle size="16" variant="Bold" color="#ffffff" />
                  </button>
                  <span className="absolute bottom-0 right-0 bg-main-color text-white rounded-full text-[10px] px-2 shadow font-medium">
                    New
                  </span>
                </>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                  <GalleryEdit size="26" variant="Outline" color="#94a3b8" />
                  <span className="text-[10px] mt-1 font-medium">Preview</span>
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-slate-400">
              {previewUrl ? "Ready" : "Waiting"}
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => switchMode("url")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              mode === "url"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LinkIcon size="18" variant={mode === "url" ? "Bold" : "Outline"} color={mode === "url" ? "#2ccce4" : "currentColor"} />
            Image URL
          </button>

          <button
            type="button"
            onClick={() => switchMode("file")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              mode === "file"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <DocumentUpload size="18" variant={mode === "file" ? "Bold" : "Outline"} color={mode === "file" ? "#2ccce4" : "currentColor"} />
            Choose File
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === "url" ? (
            /* Mode 1: URL Input */
            <div className="flex flex-col gap-2">
              <label htmlFor="imageUrlInput" className="text-sm font-medium text-slate-700">
                Picture URL
              </label>
              <div className="relative">
                <input
                  id="imageUrlInput"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  autoComplete="off"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-white transition-colors outline-none focus:ring-2 focus:ring-main-color ${
                    urlError ? "border-red-400" : "border-slate-300 focus:border-main-color"
                  }`}
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <CloseCircle size="18" color="#94a3b8" />
                  </button>
                )}
              </div>
              {urlError && <span className="text-red-500 text-xs">{urlError}</span>}
              <p className="text-xs text-slate-400">
                Paste any direct link to an image (PNG, JPG, WEBP).
              </p>
            </div>
          ) : (
            /* Mode 2: Local File Upload */
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Select Photo File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-main-color hover:bg-cyan-50/20 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-cyan-100/50 flex items-center justify-center transition-colors">
                  <DocumentUpload size="24" color="#2ccce4" variant="Bulk" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-main-color">
                    {selectedFile ? selectedFile.name : "Click to browse or drop photo"}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : "PNG, JPG, WEBP up to 5MB"}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-4">
            <AppButton
              type="submit"
              isDisabled={isSubmitting || (!previewUrl && !selectedFile && !imageUrl)}
              className="w-full bg-main-color hover:bg-main-color/80 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-200/50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check size="20" color="#ffffff" />
                  Save New Profile Picture
                </>
              )}
            </AppButton>

            {(imageUrl || selectedFile || previewUrl) && (
              <AppButton
                type="button"
                variant="danger"
                isDisabled={isSubmitting}
                onClick={handleReset}
                className="w-full cursor-pointer"
              >
                Clear Selection
              </AppButton>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default ChangeProfilePic;
