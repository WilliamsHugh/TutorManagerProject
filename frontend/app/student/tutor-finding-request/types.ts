export type TutorSuggestion = {
  id: number;
  name: string;
  avatar: string;
  match: number;
  experience: string;
  education: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  teachingMode: string;
  availableTime: string;
  phone: string;
  email: string;
  bio: string;
  tags: string[];
};

export type NavItem = {
  label: string;
  href: string;
};
