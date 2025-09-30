import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/select-role');
}