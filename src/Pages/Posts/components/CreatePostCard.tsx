import React, { useState, useRef } from "react";
import {
  Globe,
  Lock,
  ChevronDown,
  Image as ImageIcon,
  Smile,
  Send,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import type { UserData } from "../../../Context/UserAuthProvider/userAuthProvider.interface";
import { createNewPost } from "../posts.services";
import type { Post } from "../posts.interface";

interface CreatePostCardProps {
  currentUser: UserData | null;
  onPostCreated: (post: Post) => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  currentUser,
  onPostCreated,
}) => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [isFeelingOpen, setIsFeelingOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const feelings = [
    { label: "Happy", emoji: "😊" },
    { label: "Blessed", emoji: "😇" },
    { label: "Loved", emoji: "🥰" },
    { label: "Excited", emoji: "🤩" },
    { label: "Crazy", emoji: "🤪" },
    { label: "Cool", emoji: "😎" },
    { label: "Tired", emoji: "😴" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !selectedImage) {
      toast.error("Please enter some text or add an image");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      let fullBody = content.trim();
      if (selectedFeeling) {
        fullBody = `${fullBody} — feeling ${selectedFeeling}`;
      }
      if (fullBody) {
        formData.append("body", fullBody);
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const created = await createNewPost(formData);
      toast.success("Post published successfully!");
      setContent("");
      removeSelectedImage();
      setSelectedFeeling(null);
      if (created) {
        onPostCreated(created);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create post";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const userDisplayName = currentUser?.name || currentUser?.username || "friend";
  const userAvatar =
    currentUser?.photo ||
    "https://img.heroui.chat/image/avatar?w=400&h=400&u=3";

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 mb-5">
      {/* User Header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={userAvatar}
          alt={userDisplayName}
          className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-xs"
        />
        <div className="relative">
          <h4 className="text-sm font-bold text-gray-900 leading-tight">
            {userDisplayName}
          </h4>
          <div className="relative mt-0.5">
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {privacy === "public" ? (
                <Globe size={12} className="text-gray-500" />
              ) : (
                <Lock size={12} className="text-gray-500" />
              )}
              <span className="capitalize">{privacy}</span>
              <ChevronDown size={12} className="text-gray-400" />
            </button>

            {isPrivacyOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 w-36 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setPrivacy("public");
                    setIsPrivacyOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left ${
                    privacy === "public"
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Globe size={13} />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrivacy("private");
                    setIsPrivacyOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left ${
                    privacy === "private"
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Lock size={13} />
                  <span>Only me</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedFeeling && (
          <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
            <span>feeling {selectedFeeling}</span>
            <button
              onClick={() => setSelectedFeeling(null)}
              className="text-amber-500 hover:text-amber-800"
            >
              <X size={12} />
            </button>
          </span>
        )}
      </div>

      {/* Post Textarea */}
      <div className="relative mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${userDisplayName}?`}
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200/90 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-200 group max-h-64 bg-gray-50">
          <img
            src={imagePreview}
            alt="Upload preview"
            className="w-full h-auto max-h-64 object-contain mx-auto"
          />
          <button
            type="button"
            onClick={removeSelectedImage}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Feelings Selector Popup */}
      {isFeelingOpen && (
        <div className="mb-3 p-2 bg-amber-50/50 border border-amber-100 rounded-xl flex flex-wrap gap-2 animate-in fade-in">
          {feelings.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                setSelectedFeeling(`${f.emoji} ${f.label}`);
                setIsFeelingOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/60 text-xs font-medium text-gray-700 hover:bg-amber-100/70 transition-colors flex items-center gap-1.5"
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all cursor-pointer"
          >
            <ImageIcon size={18} className="text-emerald-500" />
            <span>Photo/video</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeelingOpen(!isFeelingOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-all cursor-pointer"
          >
            <Smile size={18} className="text-amber-500" />
            <span>Feeling/activity</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isLoading || (!content.trim() && !selectedImage)}
          onClick={() => handleSubmit()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <span>Post</span>
              <Send size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
