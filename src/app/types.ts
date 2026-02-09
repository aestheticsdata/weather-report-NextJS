export type WeatherReport = {
  id: string;
  city: string;
  country: string;
  temperature: number;
  condition: "sunny" | "rainy" | "cloudy" | "stormy" | "snowy";
  userId?: string; // For backward compatibility
  user?: {
    id: string;
    username?: string;
    country?: string;
    city?: string;
  };
  createdAt?: string;
};

export type UserType = "anonymous" | "authenticated";

export type ErrorModal = {
  show: boolean;
  message: string;
};

export type ConfirmationModal = {
  show: boolean;
  message: string;
};

export type WeatherFormData = {
  city: string;
  country: string;
  temperature: string;
  condition: WeatherReport["condition"];
  userId: string;
};
