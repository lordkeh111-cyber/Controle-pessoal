const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Bom dia ☀️";
  if (hour < 18) return "Boa tarde 🌤️";
  return "Boa noite 🌙";
};
