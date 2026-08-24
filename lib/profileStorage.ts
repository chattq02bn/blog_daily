export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  /** Tên hiển thị cạnh logo ở navbar */
  logoName: string;
  /** Giới thiệu ngắn trong hồ sơ */
  description?: string;
}

const PROFILE_KEY = "note_admin_profile";

export const defaultProfile: AdminProfile = {
  name: "Người quản trị",
  email: "admin@note.com",
  role: "Quản trị viên",
  avatar: "https://i.pravatar.cc/160?img=13",
  logoName: "note",
  description:
    "Người giữ nhịp cho blog — chăm chút nội dung, duy trì cộng đồng và đảm bảo mọi thứ vận hành trơn tru.",
};

export function loadProfile(): AdminProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: AdminProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("admin-profile-changed"));
}

export const PROFILE_CHANGED_EVENT = "admin-profile-changed";
