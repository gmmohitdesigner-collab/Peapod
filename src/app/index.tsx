import { Redirect } from 'expo-router';

export default function Index() {
  // Automatically redirect the root path to the home screen
  return <Redirect href="/home" />;
}
