const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Bom dia ☀️";
  if (hour < 18) return "Boa tarde 🌤️";
  return "Boa noite 🌙";
};
import { useState } from "react";

export default function Profile() {
  const [photo, setPhoto] = useState(
    localStorage.getItem("photo")
  );

  const handlePhoto = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      localStorage.setItem("photo", reader.result as string);
      setPhoto(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      <img
        src={photo || "/avatar.png"}
        width={80}
        style={{ borderRadius: "50%" }}
      />

      <input type="file" onChange={handlePhoto} />
    </>
  );
}
