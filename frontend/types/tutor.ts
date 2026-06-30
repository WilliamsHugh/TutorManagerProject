export interface Tutor {
  id: number;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviews: number;
  location: string;
  tags: string[];
  price: number;
  bio?: string;
  educationLevel?: string;
  major?: string;
  experience?: string;
  phone?: string;
  email?: string;
}