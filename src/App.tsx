
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import Loader from "./components/Loader";
import HomePage from "./HomePage";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">{loading && <Loader key="loader" />}</AnimatePresence>

      {!loading && <HomePage />}
    </>
  );
}
